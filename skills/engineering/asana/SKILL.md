---
name: asana
description: Keep work in step with its Asana task - used when an atui Task (or other work) starts, gets its specification approved or changed, changes status or gets an Artifact, in a repo whose owner is managed on Asana.
---
# Asana

"The work" is a piece of work with a description, a specification, artifacts and a status, e.g. an atui Task. These rules hold with or without atui.

## Which repos

The owner of the work's repo decides whether the work needs an Asana task:
* `PEAT-AI`, `Leeds-Life-Sciences-Pvt-Ltd`: managed on Asana; the work needs an Asana task unless the user explicitly dismisses it.
* `hkokocin`: never.
* any other owner: ask the user.

## Creating

Work that needs an Asana task and has none gets one before its specification is approved. Ask the user for the Asana project when it isn't clear. Attach the Asana task to an atui Task as an `asana` Artifact.

## Keeping it up to date

Whoever changes the work keeps its Asana task up to date:
* **Description**: the work's description and its approved specification, written as a whole after approval and again after every accepted change (e.g. an accepted Suggestion, or a change the user asks for in the session).
* **Artifacts**: every pull request, design, document or issue attached to the work is linked on the Asana task once (as an attachment or in a comment).
* **Status**: on every status change of the work,
  * the task moves to the matching section, or sets the matching status field, of its Asana project, when the project has one;
  * it is marked completed once the work is `done` or `cancelled`;
  * a comment on the task names the status change.
