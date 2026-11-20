---
paths:
  - "**/*.py"
---
# Python

- Write no new docstrings; keep existing ones.
- Group tests in classes, one per feature or endpoint.
- Verify a write (create, update, delete) directly against the database, e.g. SQLAlchemy `session.get` or `select` in a fresh session, not through the repository or service under test, which could share or cache the bug. Its return value may still be asserted on its own.
