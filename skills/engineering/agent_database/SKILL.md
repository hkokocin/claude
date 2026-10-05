---
name: agent_database
description: The Agent's own local database for automated tests, agentic tests and user reviews of branches with migrations. Used by the /develop steps and /cleanup.
---
# Agent Database

Every Agent tests against a database of its own, so Agents of the same Project don't get in each other's way.

* **Name**: `<project>_<task_id>`, lowercase, with every character that is not a letter, digit or underscore replaced by `_` (Agent `agriverse/discount-glossary` → `agriverse_discount_glossary`). A session that is no atui Agent uses `<project>_<branch>`.
* **Server**: reuse the Project's local server (Postgres, MongoDB, ...) if one is running; otherwise start it the way the Project's AGENTS.md or docker compose file describes. Never stop a server you reused.
* **Create** the database if it doesn't exist, and run the migrations on it.
* **Use it**: point the tests and the locally started app at it. How (env variable, settings) is Project-specific: follow the Project's AGENTS.md; if it doesn't say, find out, tell the user and add it to AGENTS.md.
* **Seed** it with some realistic data before a user review on it; tests set up their own data.
* **Other resources** that hold state (e.g. Redis keys, S3 mock buckets) follow the same naming when the Project needs them per Agent.

The dev database and dev services are never migrated, seeded or cleaned up by an Agent.
