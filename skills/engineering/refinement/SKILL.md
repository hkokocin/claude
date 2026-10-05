---
name: refinement
description: A relentless interview to sharpen a plan or design into an approved specification, which also creates docs (ADR's and glossary) as we go. Breaks complex Tasks down into subtasks.
---

Run in the main conversation. Move the ticket to Refinement 💬 (/ticket).

Run a `/grilling` session, using the `/domain-modeling` skill. A simple Task may need no questions: then present the specification right away.

* The user approves the specification before anything is implemented, also for simple Tasks.
* **Breakdown**: divide a complex Task into subtasks that can each be implemented, reviewed and merged on their own, in order. Agree on them with the user.
* Write the result into the ticket as /ticket describes: TL;DR, then specification. With a breakdown, create one Asana subtask per subtask with its TL;DR and specification, assigned to the user; the parent ticket only gets the TL;DR.
* Once the session is finished make a suggestion if the adr is worth keeping or if the insights should be written to the issue tracker issue only.
* If we keep the adr then mention it in the issue tracker issue.
* Update the ticket description. Don't just write a comment that might disagree with the description or hide requirements.
