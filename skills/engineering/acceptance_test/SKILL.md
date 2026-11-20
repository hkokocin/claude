---
name: acceptance_test
description: Use in /review locally and on dev after a deployment, to test the changed behaviour of the running app from the outside.
---
# Acceptance Test

Test the behaviour changed on the branch (or by the merged pull request) the way a client sees it.

Where it runs depends on the Task's tier (/develop): `small` in the main conversation, without the monkeytest; `medium` in a sub agent on `sonnet`; `large` in a sub agent on `opus`.

Targets:
* **local**: the app started on the Agent's own databases (/agent_database).
* **dev**: the deployed dev environment. No monkeytest there, others use its data; remove any data the test creates.

Test:
* backend with curl, writing the requests into the collection with /curl as you go
* frontend in a real browser (chrome-devtools)
* the known use cases from the specification
* local, not `small`: a /monkeytest of the changed endpoints

Report what failed, with the request or steps to reproduce it.
