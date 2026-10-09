---
name: refinement
description: A relentless interview to sharpen a plan or design into an approved specification, which also creates docs (ADR's and glossary) as we go. Breaks complex Tasks down into subtasks.
---

Run in the main conversation. Set the Task's status to `refinement` (/task).

Run a `/grilling` session, using the `/domain-modeling` skill. A simple Task may need no questions: then present the specification right away.

* Post each decision taken with the user on the Task's Stream as it is made (/task). The Stream holds the decisions; the Specification holds what follows from them.
* The user approves the specification before anything is implemented, also for simple Tasks.
* **Breakdown**: divide a complex Task into subtasks that can each be implemented, reviewed and merged on their own, in order. Agree on them with the user.
* Write the result into the Task's Specification as /task describes: TL;DR, then specification. With a breakdown, create a Subtask for each with `create_task(project, title, specification)`, holding its TL;DR and specification; the Parent Task's Specification keeps only the TL;DR.
* Once the session is finished make a suggestion if the adr is worth keeping or if the insights should be written to the Task's Specification only.
* If we keep the adr then mention it in the Task's Specification.
* Replace the Specification as a whole. Don't just add a note that might disagree with it or hide requirements.
