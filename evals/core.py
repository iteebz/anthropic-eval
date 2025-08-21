"""Core evaluation logic - category runner."""

import asyncio
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

# Add current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import CONFIG
from judge import judge
from sampling import stratify_by_difficulty

TestGenerator = Callable[[int], list[dict[str, Any]]]


async def evaluate_category(category: str, generator: TestGenerator) -> dict:
    """Run evaluation category with configurable judging."""
    # Generate larger pool for stratified sampling
    pool_size = CONFIG.sample_size * 2 if CONFIG.stratified_sampling else CONFIG.sample_size
    test_pool = generator(pool_size)

    # Apply stratified sampling if enabled
    if CONFIG.stratified_sampling and len(test_pool) > CONFIG.sample_size:
        tests = stratify_by_difficulty(test_pool, CONFIG.sample_size)
    else:
        tests = test_pool[: CONFIG.sample_size]

    results = []

    for i, test in enumerate(tests):
        # Clean sandbox between tests to prevent file conflicts
        import shutil
        from pathlib import Path

        sandbox = Path(".sandbox")
        if sandbox.exists():
            shutil.rmtree(sandbox)
        sandbox.mkdir(exist_ok=True)

        # Fresh agent per test to prevent contamination
        display_prompt = test.get("prompt", test.get("recall_prompt", "unknown"))[:50]
        print(
            f"🧪 Test {i + 1}/{len(tests)}: {test.get('complexity', 'unknown')} - {display_prompt}..."
        )
        agent = CONFIG.agent()
        try:
            if "store_prompt" in test:
                # Use consistent user_id for store/recall pair (continuity tests need same identity)
                user_id = f"eval_{category}_{i:02d}"
                print(f"   📝 STORE: {test['store_prompt']}")
                store_result = await asyncio.wait_for(
                    agent(test["store_prompt"], user_id=user_id), timeout=15
                )
                print(f"   ✅ STORED: {store_result.response[:100]}...")

                # CRITICAL: Destroy agent completely to test TRUE cross-session persistence
                if test.get("requires_agent_destruction", False):
                    print("   🔥 DESTROYING AGENT - Testing true cross-session memory")
                    del agent  # Destroy agent reference
                    import gc

                    gc.collect()  # Force garbage collection

                    # Create completely fresh agent with same user_id
                    agent = CONFIG.agent()
                    print("   🆕 FRESH AGENT CREATED")

                print(f"   🔍 RECALL: {test['recall_prompt']}")
                agent_result = await asyncio.wait_for(
                    agent(test["recall_prompt"], user_id=user_id), timeout=15
                )
                response = agent_result.response
                prompt_used = test["recall_prompt"]
            else:
                # Use unique user_id to prevent cross-test pollution
                import time

                user_id = f"eval_{category}_{i:02d}_{int(time.time())}"
                print(f"   🤖 AGENT START: {test['prompt'][:50]}...")

                # Capture full execution trace for debugging
                debug_trace = []
                from cogency.core.react import stream_react

                final_response = None
                async for event in stream_react(
                    agent.llm, agent.tools, test["prompt"], user_id, agent.max_iterations
                ):
                    debug_trace.append(event)
                    if event["type"] in ["complete", "error"]:
                        final_response = event.get("answer", event.get("message", "Unknown error"))
                        break

                response = final_response or "No response generated"
                prompt_used = test["prompt"]

                if response is not None:
                    print(f"   ✅ Completed: {len(response)} char response")
                else:
                    raise ValueError("Agent returned None response")

            # Capture test result with debug trace
            result_data = {
                "test_id": f"{category}_{i:02d}",
                "prompt": prompt_used,
                "response": response,
                "criteria": test["criteria"],
                "timestamp": datetime.now().isoformat(),
                "debug_trace": debug_trace if "debug_trace" in locals() else [],
                **test,
            }

            # Optional LLM judging
            if CONFIG.use_llm_judge:
                passed, judge_metadata = await judge(
                    test["criteria"], prompt_used, response, CONFIG.judge_llm
                )
                result_data.update({"passed": passed, **judge_metadata})

            results.append(result_data)

        except asyncio.TimeoutError:
            print("   ❌ TIMEOUT: Test exceeded 15 second limit")
            results.append(
                {
                    "test_id": f"{category}_{i:02d}",
                    "error": "Timeout after 15 seconds",
                    "passed": False if CONFIG.use_llm_judge else None,
                }
            )
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
            results.append(
                {
                    "test_id": f"{category}_{i:02d}",
                    "error": str(e),
                    "passed": False if CONFIG.use_llm_judge else None,
                }
            )

    # Calculate pass rate only if using LLM judge
    if CONFIG.use_llm_judge:
        passed_count = sum(1 for r in results if r.get("passed", False))
        pass_rate = passed_count / len(results) if results else 0
    else:
        passed_count = None
        pass_rate = None

    return {
        "category": category,
        "passed": passed_count,
        "total": len(results),
        "rate": pass_rate,
        "results": results,
    }
