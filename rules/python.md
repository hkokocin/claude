---
paths:
  - "**/*.py"
---
# Python

- No docstrings: names and tests carry the meaning, and docstrings drift from the code.
- Group tests in classes, one per feature or endpoint.
- Verify a write (create, update, delete) directly against the database, e.g. with SQLAlchemy `session.get` or `select` in a fresh session. Reading it back through the repository or service under test could share or cache the bug. The write's return value may still be asserted on its own.
