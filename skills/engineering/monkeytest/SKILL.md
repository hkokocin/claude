---
name: monkeytest
description: Use to probe a running service's changed endpoints or screens with random and edge-case input for bugs use cases miss.
---
# Monkeytest

Unless told otherwise, target the local environment and the endpoints changed on the current branch.

1. Bring the branch up to date with main (/merge).
2. Locally, start the app with its migrations on the Agent's own databases (/agent_database), not on the Project's own compose stack.
3. Read the API spec.
4. On a feature branch, let a sub agent find the endpoints the branch changed and return only that list.
5. Monkeytest the endpoints in scope.
