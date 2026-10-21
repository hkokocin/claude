---
name: agent_database
description: The Agent's own local databases for automated tests, agentic tests and user reviews - Leases of atui resources. Used by the /develop steps and /cleanup.
---
# Agent Database

Every test run and every app an Agent starts locally runs on databases of its own, so Agents, and the sub agents of one Agent, never get in each other's way. atui provides them (`atui resources`); the Project knows nothing about atui and only reads its environment.

* **Tests**: run the Project's test command as `atui resources run -- <test command>` (e.g. `atui resources run -- poetry run pytest`). A Project whose tests read a `.env` gets it sourced first, so atui's variables win: `set -a && source .env && set +a && atui resources run -- <test command>`. The run gets Leases of its own on shared local containers - a Postgres or Mongo database, a numbered Redis database, an s3mock bucket, named `<project>_<number>_<hex>` - and the Project's environment variables pointing at them. atui starts the containers on demand, on free ports, and releases the Leases afterwards, also when the run fails; the last release stops the container. Parallel sub agents each use their own `atui resources run`.
* **App** for a user review or a local acceptance test: start it as `atui resources run -- <start command>`; its Leases live as long as the app. Migrate and seed it with some realistic data in the same run, e.g. `atui resources run -- sh -c '<migrate> && <seed> && <start>'`; tests set up their own data.
* **Configuration**: the Project's Resources (compose services of the worktree, or images) and environment variables are in `~/.config/atui/resources.toml`, versioned in the claude repo (`atui/resources.toml`). A Project without a section: find out which compose services and environment variables its tests use, add the section, and tell the user.
* Never run tests against a Project's own compose stack or a fixed local port: those clash with other Agents and the user's dev stacks.
* `atui resources list` shows the running Resources and their Leases.

The dev database and dev services are never migrated, seeded or cleaned up by an Agent.
