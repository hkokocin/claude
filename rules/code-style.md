# Code Style

## Principles (in order of priority)
1. **YAGNI** — Only implement what is needed now. No speculative features.
2. **KISS** — Prefer simple over clever. Obvious over elegant.
3. **DRY** — Extract duplicated logic, but do not over-abstract prematurely.

## Structure
- Pure functions for logic (no side effects, easy to test)
- Classes for infrastructure (DB, cache, external services) with dependency injection
- Separate layers: API → Service → Repository → Database
