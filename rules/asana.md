# Asana Rules

These rules speak of "the work": a piece of work with a description, a specification, artifacts and a status, e.g. an atui Task with its Description, Specification, Artifacts and status. They hold with or without atui. Use the Asana MCP tools (`update_tasks`, `add_comment`, `get_project` for sections and custom fields).

## Which repos

The owner of the work's repo (`gh repo view --json owner -q .owner.login`) decides whether the work needs an Asana task:
* `PEAT-AI`, `Leeds-Life-Sciences-Pvt-Ltd`: managed on Asana. The work needs an Asana task, unless the user explicitly dismisses it.
* `hkokocin`: never.
* any other owner: ask the user.

## Creating

Work that needs an Asana task and has none gets one before its specification is approved. Ask the user for the Asana project when it isn't clear. Where the work is an atui Task, attach the Asana task to it with type `asana`.

## Kept up to date

Whenever an Asana task exists for the work, whoever changes the work keeps the Asana task up to date:
* **Description**: the work's description and its approved specification, written as a whole after approval and again after every accepted change (e.g. an accepted Suggestion, or a change the user asks for in the session).
* **Artifacts**: every pull request, design, document or issue attached to the work is added to the Asana task as a link (an attachment or a comment with the link), once.
* **Status**: on every change of the work's status, the Asana task follows:
  * it moves to the section, or sets the status field, of its Asana project that matches the status, when the project has one;
  * it is marked completed once the work is done: `on-dev` counts as in review, `done` and `cancelled` as completed;
  * a comment names each change.
