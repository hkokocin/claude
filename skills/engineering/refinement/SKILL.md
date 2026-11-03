---
name: refinement
description: A relentless interview to sharpen a plan or design into an approved specification, which also creates docs (ADR's and glossary) as we go. Breaks complex Tasks down into subtasks.
---

Run in the main conversation. Set the Task's status to `refinement` (/atui).

Run a `/grilling` session, using the `/domain-modeling` skill. A simple Task may need no questions: then present the specification right away.

* Ask each choice on the Task's Stream as a Decision with options, the recommendation marked (/atui, Stream); a choice the user makes in the session is recorded on it with `choose`, any other decision as the Answer on its Thread or a short Post. The Stream holds the decisions; the Specification holds what follows from them.
* On a Task that changes a UI, propose a Design per affected screen and iterate on it with the user (see Designs).
* The user approves the specification before anything is implemented, also for simple Tasks, and every Design of the Task as well. Once they approved it in the session, record it with `approve()`, after the final Specification is on the Task: a new version clears the approval. In the web UI the user may approve it instead: its approval Message counts the same. Subtasks written from an approved Specification are created approved: `create_task(..., approved=true)`. Subtasks created during the refinement, before the user approved, are approved by the Parent once the user approved: `approve(task="<project>/<number>")` for each.
* **Breakdown**: divide a complex Task into subtasks that can each be implemented, reviewed and merged on their own, in order. Agree on them with the user.
* **Lock in**: a part the user locks in becomes an approved Subtask right away, while the refinement goes on: write its Specification from its Threads on the Stream, create it with `create_task(..., approved=true)` and its `tier`, spawn its Friend (/atui, Friends) and record it as the Answer on the Thread it settles.
* Write the result into the Task's Description and Specification as /atui describes. The Specification follows /specification. With a breakdown, create a Subtask for each with `create_task(project, title, description, specification)`, with `approved=true` once the user approved it; the Parent Task keeps only its Description. A `large` Task without a breakdown gets one Subtask with the whole Description and Specification, for its Friend (/atui, Friends); the Parent keeps only its Description as well.
* Once the session is finished propose whether the adr is worth keeping or if the insights should be written to the Task's Specification only.
* If we keep the adr then mention it in the Task's Specification.
* Replace the Specification as a whole. Don't just add a note that might disagree with it or hide requirements.

## Designs

On a Task that changes a UI, the user sees the screens before anything is built. The tools, the files and the Messages are in /atui, Designs.

1. **When**: once the requirements of a screen are clear, propose its Design. Don't wait for the whole Specification, and don't propose before the screen's content is settled.
2. **Which**: one Design per screen the Task adds or changes, named after the screen, e.g. "Task Page". A dialog or panel that is a part of a screen goes into that screen's Design.
3. **Three Drafts** per Design, A, B and C: three distinct layouts of the same content, each with its own idea (e.g. a list with a side panel, cards, a table). Colour or spacing variations of one layout are not three ideas. Build each with the project's design system, from its code. On a changed screen, start from what the screen shows today.
4. **Iterate**: the user accepts, replaces or explores Drafts, reopens an accepted Design and asks for changes on its Threads. Answer each as /atui, Designs says, until the user has accepted a Draft of every Design and approved a version of it.
5. **The Specification names the Designs** (/specification, Designs). A Design added or dropped changes the Specification. A new version of a Design doesn't.

The refinement ends only once the Specification and every Design of the Task are approved (`task()` shows each Design with "approved v<n>"). A Design the user approved in the session is recorded with `approve_design(design)` (/atui, Designs).

With a breakdown, the Designs stay on the Parent's Task. A Friend that builds a screen gets the Design and its approved version named in its Instructions (/atui, Friends).

## Tier

End by rating the Task; the tier decides model, sub agents and review depth of the later steps (/develop):
* `small`: one clear change, no new domain concept, no migration, no new endpoint or screen (a bug fix, a config change, a field or validation, a text change).
* `medium`: a feature within existing patterns: a new endpoint, screen, table or migration, but no new architecture and no breakdown.
* `large`: new concepts or architecture, several components, needs an ADR, or a breakdown. A Parent with a breakdown is always `large`; each Subtask gets its own rating.

When in doubt, one tier up. Present the rating with the Specification; the user approves or overrides it. Store it on the Task with `set_property(key="tier", value="<tier>")`, and on each Subtask right after creating it (`set_property(key="tier", value="<tier>", task="<project>/<number>")`).
