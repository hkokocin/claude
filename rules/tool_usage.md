# Tool Usage

* Prefer separate Bash tool calls over chaining with `&&` or `;`. The sandbox blocks chained commands even when each individual command is allowed separately. Only chain when the commands genuinely need to share shell state (e.g. `source .env && poetry run pytest`).
