---
name: refinement
description: Use when a Task or plan needs pinning down into an approved Specification, Designs and tier before anything is built.
---
# Refinement

Run a /grilling session in the main conversation, using /domain-modeling, and write docs (ADR, glossary) as decisions are made. A simple Task may need no questions: present the Specification right away. What the user approves: /develop, Steps.

Where the repo owner says the work needs an Asana task, create it before the Specification is approved (/asana).

* Each choice is a Decision on the Stream, the recommendation marked (/atui, Stream). A choice made in the session is recorded as its Choice, any other decision as the Answer on its Thread or a short Post. The Stream holds the decisions; the Specification holds what follows from them.
* Write the result into the Task's Description and Specification (/atui), formatted as /specification says. Replace the Specification as a whole; a note added to it might disagree with it or hide requirements.
* **Approval**: record it as /atui, Description and Specification says, with the final Specification on the Task first: a new version clears the approval. Subtasks written from an approved Specification are created approved; those created before the user approved, the Parent approves once the user did. Before asking for approval again, read the Subtasks' Streams: the user's comments there reach only that Subtask's Agent.
* Once the session is finished, propose whether the ADR is worth keeping or the insights belong only in the Specification. A kept ADR is named in the Specification.
* **Breakdown**: divide a complex Task into Subtasks that can each be implemented, reviewed and merged on their own, in order, and agree on them with the user (under Autopilot the Agent writes and approves them itself, /autopilot). Each Subtask gets its own Description, Specification and tier; the Parent keeps only its Description. A `large` Task without a breakdown gets one Subtask with the whole Description and Specification, for its Friend (/atui, Friends); the Parent keeps only its Description there as well.
* **Lock in**: a part the user locks in becomes an approved Subtask right away while the refinement goes on: write its Specification from its Threads, create it approved with its tier, spawn its Friend (/atui, Friends) and record it as the Answer on the Thread it settles.

## Designs

On a Task that changes a UI, the user sees the screens before anything is built. The tools, files and Messages are in /atui, Designs.

1. **When**: propose a screen's Design once its content is settled; don't wait for the whole Specification.
2. **Which**: one Design per screen the Task adds or changes, named after the screen (e.g. "Task Page"). A dialog or panel goes into its screen's Design.
3. **Three Drafts**, A, B and C: three distinct layouts of the same content, each with its own idea (e.g. list with side panel, cards, table); colour or spacing variations of one layout are not three ideas. Build them with the project's design system, from its code; on a changed screen, start from what it shows today.
4. **Iterate** as /atui, Designs says, until the user accepted a Draft of every Design and approved a version of it.
5. The Specification names the Designs (/specification). Adding or dropping a Design changes the Specification (a Suggestion once it is approved); a new version of a Design doesn't.

With a breakdown, the Designs stay on the Parent's Task; a Friend that builds a screen gets the Design and its approved version named in its Instructions (/atui, Friends).

## Tier

End by rating the Task; the tier decides model, sub agents and review depth of the later steps (/develop, Tiers):
* `small`: one clear change, no new domain concept, migration, endpoint or screen (a bug fix, a config change, a field or validation, a text change).
* `medium`: a feature within existing patterns: a new endpoint, screen, table or migration, but no new architecture and no breakdown.
* `large`: new concepts or architecture, several components, needs an ADR, or a breakdown. A Parent with a breakdown is always `large`; each Subtask gets its own rating.

When in doubt, one tier up. Present the rating with the Specification; the user approves or overrides it. Store it as the Task's `tier` property, and on each Subtask right after creating it.
