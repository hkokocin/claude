---
name: agent_database
description: Use whenever an Agent runs tests or starts an app locally, to give it databases of its own as atui resource Leases.
---
# Agent Database

Every test run and app an Agent starts locally gets databases of its own, so Agents and their sub agents never get in each other's way. atui provides them as Leases (`atui resources`); the Project only reads its environment.

* **Tests**: run the Project's test command under `atui resources run -- <test command>`. It leases a Postgres or Mongo database, a numbered Redis database or an s3mock bucket on shared containers, points the Project's environment variables at them and releases them afterwards, also on failure. Each parallel sub agent uses its own run. A Project whose tests read a `.env` sources it first (`set -a && source .env && set +a && atui resources run -- …`), so atui's variables win.
* **App** for a user review or a local acceptance test: start it the same way; its Leases live as long as the app. Migrate and seed it with realistic data in the same run (`atui resources run -- sh -c '<migrate> && <seed> && <start>'`); tests set up their own data.
* **Configuration**: each Project's Resources and environment variables are in `~/.config/atui/resources.toml`, versioned in the claude repo as `atui/resources.toml`. For a Project without a section, find out which compose services and variables its tests use, add the section and tell the user.
* Tests never run against a Project's own compose stack or a fixed local port: those clash with other Agents and the user's dev stacks.

Never migrate, seed or clean up the dev database or dev services.
