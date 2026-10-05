---
name: acceptance_test
description: Test the changed behaviour of a running app from the outside - curl for backend, a real browser for frontend, the known use cases and a monkeytest. Runs locally in /review and on dev after the deployment.
---
# Acceptance Test

Run it in an Opus sub agent. It tests the behaviour changed on the branch (or by the merged pull request), against a target:
* **local**: the app started locally against the Agent's own database (/agent_database)
* **dev**: the deployed dev environment

Test:
* backend: with curl; write the requests into the collection with /curl as you go
* frontend: in a real browser (chrome-devtools)
* the known use cases from the specification
* local only: a /monkeytest of the changed endpoints. On dev it is skipped, since it would leave junk in data others use; data the test creates on dev is removed again.

Report what failed, with the request or steps to reproduce it.
