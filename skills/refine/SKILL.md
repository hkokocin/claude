---
name: refine
description: Analyze and clarify requirements interactively. Focus on WHAT not HOW.
disable-model-invocation: true
---
# Requirements Analysis

Analyze requirements and clarify with the user. Focus on WHAT, not HOW.

## Task
1. Analyze the requirements. Ingest API docs of the project for context.
2. Run a clarification loop with the user until approved:
   - Identify open questions, ambiguities, contradictions
   - Make up to 3 proposals to resolve each issue
   - Ask the user to choose or provide an alternative
3. Convey ALL questions you ask yourself to the user. Add your thoughts as context.
4. Your task is NOT complete until the user has explicitly approved.

## Constraints
- MUST focus on requirements (behaviour, not implementation)
- MUST NOT read source code files except for API docs
- MUST NOT consider implementation details
- Use extended thinking for complex decisions
