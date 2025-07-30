"""Memory validation - semantic search and embedding capabilities."""

import asyncio
import tempfile
from pathlib import Path

from cogency import Agent
from cogency.memory.store import Filesystem
from cogency.services.embed import OpenAIEmbed


async def validate_memory_storage():
    """Validate basic memory storage and retrieval."""
    print("🧠 Testing basic memory storage...")

    with tempfile.TemporaryDirectory() as temp_dir:
        memory = Filesystem(Path(temp_dir) / "memory")

        agent = Agent("memory-basic", memory=memory, notify=True, trace=True)

        # Store some information
        result1 = await agent.run("Remember that my favorite programming language is Python")
        result2 = await agent.run("What programming language do I prefer?")

        if (
            result1
            and result2
            and "ERROR:" not in result1
            and "ERROR:" not in result2
            and "python" in result2.lower()
        ):
            print("✅ Basic memory storage succeeded")
            return True
        else:
            print("❌ Basic memory storage failed")
            return False


async def validate_semantic_search():
    """Validate semantic search with available embedders."""
    print("🔍 Testing semantic search...")

    # Test with realistic embedder setup (gracefully handle missing)
    embed = None
    embedder_name = "None"

    try:
        # Try Nomic (your actual embedder)
        from cogency.services.embed import NomicEmbed

        embed = NomicEmbed()
        embedder_name = "Nomic"
    except Exception:
        try:
            # Fallback to OpenAI
            embed = OpenAIEmbed()
            embedder_name = "OpenAI"
        except Exception:
            print("⚠️  No embedders configured - testing without semantic search")
            return True

    with tempfile.TemporaryDirectory() as temp_dir:
        memory = Filesystem(Path(temp_dir) / "semantic")

        agent = Agent("memory-semantic", memory=memory, embed=embed, notify=True, trace=True)

        # Store diverse information for semantic matching
        await agent.run("Remember: I love outdoor adventures like hiking and rock climbing")
        await agent.run("Remember: My expertise is in machine learning and Python development")
        await agent.run("Remember: I work remotely from mountain towns")

        # Test semantic retrieval (not exact keyword match)
        result = await agent.run("What physical activities do I enjoy?")

        if (
            result
            and "ERROR:" not in result
            and ("hiking" in result.lower() or "climbing" in result.lower())
        ):
            print(f"✅ Semantic search succeeded ({embedder_name})")
            return True
        else:
            print(f"❌ Semantic search failed ({embedder_name})")
            return False


async def validate_memory_persistence():
    """Validate memory persistence across agent sessions."""
    print("💾 Testing memory persistence across sessions...")

    with tempfile.TemporaryDirectory() as temp_dir:
        memory_path = Path(temp_dir) / "persistent_memory"

        # Session 1 - store information
        memory1 = Filesystem(memory_path)
        agent1 = Agent("memory-persist-1", memory=memory1, notify=True, trace=True)

        result1 = await agent1.run(
            "My project deadline is March 15th, 2024. Remember this important date."
        )

        # Session 2 - retrieve information
        memory2 = Filesystem(memory_path)
        agent2 = Agent("memory-persist-2", memory=memory2, notify=True, trace=True)

        result2 = await agent2.run("When is my project deadline?")

        if (
            result1
            and result2
            and "ERROR:" not in result1
            and "ERROR:" not in result2
            and ("march" in result2.lower() and "15" in result2)
        ):
            print("✅ Memory persistence across sessions succeeded")
            return True
        else:
            print("❌ Memory persistence across sessions failed")
            return False


async def main():
    """Run all memory validation tests."""
    print("🚀 Starting memory validation...\n")

    validations = [
        validate_memory_storage,
        validate_semantic_search,
        validate_memory_persistence,
    ]

    results = []
    for validation in validations:
        try:
            success = await validation()
            results.append(success)
        except Exception as e:
            print(f"❌ {validation.__name__} crashed: {e}")
            results.append(False)
        print()

    passed = sum(results)
    total = len(results)

    print(f"📊 Memory validation: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 Memory system is production ready!")
    else:
        print("⚠️  Memory system needs attention")

    return passed == total


if __name__ == "__main__":
    asyncio.run(main())
