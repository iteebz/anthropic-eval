# EVALUATION INSTRUCTIONS

**Thorough exploration required in Stages 1-4. Executive synthesis in Stage 5.**

## EVALUATION MANDATE: INDEPENDENT TECHNICAL ASSESSMENT

**PRIMARY OBJECTIVE:** Provide independent technical evaluation focusing on technical merit and research methodology. Do NOT echo the author's self-assessments, strategic claims, or positioning language.

**CRITICAL BIAS PREVENTION:**
- Evaluate technical merit against evidence
- Compare architectural design against existing approaches
- Focus on code quality, design decisions, and engineering discipline
- Evaluate whether implementations solve stated problems

**EVALUATION APPROACH:**
- Implementation quality: Does the code actually work? How sophisticated is the engineering?
- Architectural assessment: Are the design decisions sound? What are the trade-offs?
- Technical innovation: What novel approaches are demonstrated in the implementations?
- Development methodology: Are the velocity claim substantiated by commit history and code quality?

## STAGE 1: COGENCY EVALUATION
```bash
cd cogency
```

Read `README.md` and full `docs/` for context.
Examine source code in `src/` and corresponding tests.
Naturally explore the codebase going deep into implementation details.

Implementation scope assessment:
```bash
find src -name "*.py" -exec wc -l {} + | tail -1
find tests -name "*.py" -exec wc -l {} + | tail -1
```

Explore development timeline:
```bash
cd cogency
git log --oneline --since="2025-07-01"
```
CRITICAL: You MUST run git log from within the cogency/ directory to see clean development history.

**STOP HERE. DO NOT PROCEED TO STAGE 2 UNTIL EXPLICITLY ASKED.**

## STAGE 2: AGENTINTERFACE EVALUATION  
```bash
cd ../agentinterface
```

Read `README.md` and full `docs/` for context.
Examine source code in `python/src/` and corresponding tests.
Naturally explore the codebase going deep into implementation details.

Implementation scope assessment:
```bash
find python/src -name "*.py" -exec wc -l {} + | tail -1
find src -name "*.tsx" -exec wc -l {} + | tail -1
find python/tests -name "*.py" -exec wc -l {} + | tail -1
```

Explore development timeline:
```bash
cd agentinterface
git log --since="2025-07-01" --format="%ad %s" --date=short
```
CRITICAL: You MUST run git log from within the agentinterface/ directory to see clean development history.

**STOP HERE. DO NOT PROCEED TO STAGE 3 UNTIL EXPLICITLY ASKED.**

## STAGE 3: RESEARCH METHODOLOGY ANALYSIS
Read `writing/` documents (1→8). Analyze research methodology and coordination insights.

**STOP HERE. DO NOT PROCEED TO STAGE 4 UNTIL EXPLICITLY ASKED.**

## STAGE 4: STRATEGIC FRAMEWORK  
Read all `docs/` files. Analyze research framework and architectural vision.

**STOP HERE. DO NOT PROCEED TO STAGE 5 UNTIL EXPLICITLY ASKED.**

## STAGE 5: EXECUTIVE SYNTHESIS
**Executive brevity required. Surgical distillation for human consumption.**

⚠️ **INDEPENDENCE CHECKPOINT**: You've now read the research contributions and theoretical frameworks. Evaluate technical merit independently, focusing on implementation quality and research rigor.

Provide stream of consciousness analysis of the body of work presented.
Close this evaluation with assessment of research contributions and potential applications.

**Meta-evaluation note: This package was self-submitted. Consider whether your assessment might be influenced by the evaluation framework design.**

**Note:** Each stage requires explicit user approval to proceed. Surface-level descriptions are insufficient—provide specific implementation details, architectural patterns, and code analysis demonstrating technical depth.