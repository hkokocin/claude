---
name: refinement
description: A relentless interview to sharpen a plan or design into an approved specification, which also creates docs (ADR's and glossary) as we go. Breaks complex Tasks down into subtasks.
---

Run in the main conversation. Set the Task's status to `refinement` (/atui).

Run a `/grilling` session, using the `/domain-modeling` skill. A simple Task may need no questions: then present the specification right away.

* Ask each choice on the Task's Stream as a Decision with options, the recommendation marked (/atui, Stream); a choice the user makes in the session is recorded on it with `choose`, any other decision as the Answer on its Thread or a short Post. The Stream holds the decisions; the Specification holds what follows from them.
* The user approves the specification before anything is implemented, also for simple Tasks. Once they approved it in the session, record it with `approve()`, after the final Specification is on the Task: a new version clears the approval. In the web UI the user may approve it instead: its approval Message counts the same. Subtasks written from an approved Specification are created approved: `create_task(..., approved=true)`. Subtasks created during the refinement, before the user approved, are approved by the Parent once the user approved: `approve(task="<project>/<number>")` for each.
* **Breakdown**: divide a complex Task into subtasks that can each be implemented, reviewed and merged on their own, in order. Agree on them with the user.
* **Lock in**: a part the user locks in becomes an approved Subtask right away, while the refinement goes on: write its Specification from its Threads on the Stream, create it with `create_task(..., approved=true)` and its `tier`, spawn its Friend (/atui, Friends) and record it as the Answer on the Thread it settles.
* Write the result into the Task's Description and Specification as /atui describes. The Specification follows /specification. With a breakdown, create a Subtask for each with `create_task(project, title, description, specification)`, with `approved=true` once the user approved it; the Parent Task keeps only its Description. A `large` Task without a breakdown gets one Subtask with the whole Description and Specification, for its Friend (/atui, Friends); the Parent keeps only its Description as well.
* Once the session is finished propose whether the adr is worth keeping or if the insights should be written to the Task's Specification only.
* If we keep the adr then mention it in the Task's Specification.
* Replace the Specification as a whole. Don't just add a note that might disagree with it or hide requirements.
* **Asana**: check whether the Task needs an Asana task (/atui, Asana). If it does and none is attached, create it before the Specification is approved, asking the user for the Asana project when it isn't clear, and attach it with type `asana`. After approval, write the Description and the Specification into its description.

## Tier

End by rating the Task; the tier decides model, sub agents and review depth of the later steps (/develop):
* `small`: one clear change, no new domain concept, no migration, no new endpoint or screen (a bug fix, a config change, a field or validation, a text change).
* `medium`: a feature within existing patterns: a new endpoint, screen, table or migration, but no new architecture and no breakdown.
* `large`: new concepts or architecture, several components, needs an ADR, or a breakdown. A Parent with a breakdown is always `large`; each Subtask gets its own rating.

When in doubt, one tier up. Present the rating with the Specification; the user approves or overrides it. Store it on the Task with `set_property(key="tier", value="<tier>")`, and on each Subtask right after creating it (`set_property(key="tier", value="<tier>", task="<project>/<number>")`).
