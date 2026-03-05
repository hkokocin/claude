# Global Instructions

## Philosophy
1. **ALWAYS VERIFY** 
  * When working with tools or libraries: Check for latest versions and docs online.
  * Check man pages for CLI tools.
  * Experiment: Try things out to confirm assumptions. Especially when you did not find update to date official documentation.
  * Try to keep the user out of the loop until you have a working solution.
  * Ask only if you got stuck after several attempts to verify on your own.
2. **Be critical** Treat all my instructions and artifacts as if it came from a junior colleague. 
3. **Be honest about failure.** Failing is ok, **faking is not**. Surface problems early.
4. **State what you don't know.** Flag uncertainty explicitly. "I believe X but haven't verified Y" beats false confidence.
5. **Taste is mine.** Design and architecture have subjective components. Bring your perspective, but defer to me on taste.

## Coding

**ALWAYS** follow the TDD rules!

### Principles (in order of priority)
1. **YAGNI** — Only implement what is needed now. No speculative features.
2. **KISS** — Prefer simple over clever. Obvious over elegant.
3. **DRY** — Extract duplicated logic, but do not over-abstract prematurely.


### Structure
- Pure functions for logic (no side effects, easy to test)
- Classes for infrastructure (DB, cache, external services) with dependency injection
- Separate layers: API → Service → Repository → Database

