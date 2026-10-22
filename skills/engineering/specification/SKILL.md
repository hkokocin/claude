---
name: specification
description: The structure and formatting of an atui Task Specification - sections of a Task and of a parent with a breakdown, sources as Artifacts and links, model code blocks, the endpoint section template. Used by /refinement.
---
# Specification

How a Specification (/atui, Description and Specification) is built and formatted. /refinement writes it from the decisions on the Stream.

## Principles

1. **Requirements over solutions.** Read the customer's sources for the required outcome, not for the solution they propose; their solution may be needlessly complex for the same end. Where the Specification departs from a source, say so inline ("Decision: …") and keep the reason on the Task's Stream.
2. **The Stream holds decisions, the Specification holds what follows from them.** The Specification never argues; it states.
3. **One source of truth.** Replace the Specification as a whole; never patch it with notes that might contradict it. Shared design lives once, in the parent Task; Subtasks hold only their own content.
4. **Written for Agents, readable by humans.** Precise enough to implement without re-opening settled questions; sources linked so an Agent can verify.
5. **Pasteable drafts.** When the project has its own API documentation (e.g. a document the Agent cannot write), endpoint sections follow that documentation's numbering and format exactly, so the user can paste them.

## Sources and Artifacts

* Attach every source (document, sheet, PDF, ticket, design, issue) to the Task **and to every Subtask** as an Artifact (`attach`, /atui) before referencing it.
* In the text, a source is always a markdown link on a short noun: `[tracking sheet](url)`, `[Gherkin spec](url)`, `[Asana task](url)`. Never a bare URL, never an ID alone.
* Requirements cite their place in the source: scenario id and page (`ADM-GEO-01..05, p. 3`), sheet tab, doc section.

## Layout of a Task or Subtask

A Subtask starts with one pointer line, nothing else shared:

> Shared design: the Specification of the parent Task <project>/<number> "<title>" (`task(task="<project>/<number>")`) holds <what it holds>. Read it first; it applies here in full.

Then, in this order. Leave out sections that do not apply; never leave them empty.

1. `# <Title>`; for a Subtask `# Subtask <n>: <title>`.
2. `## Goal`: 2-4 sentences on what changes and why; the end state, not the steps.
3. `## Requirements (customer)`: bullets; each cites its source; a bullet that overrides the source carries `Decision: …`.
4. `## Data model`: `` ```python model `` block(s) for the ORM / pydantic shape, `` ```sql model `` block(s) with the DDL of every new or changed table; pure functions named with their signatures.
5. `## Repository and service` or `## Behaviour`: what each layer does, numbered steps where order matters, what disappears.
6. `## API` (or `## API changes`): one section per endpoint in the endpoint template below; a changed endpoint lists only what changes; the heading carries the section number of the project's API documentation when it has one (`### 14.1 Admin: Create Geography`), new numbers continue it.
7. `## Errors`: new, changed and removed error codes with their status.
8. `## Migration`: what the migration creates, backfills, drops; the policy that applies (e.g. NOT NULL from the start, destructive allowed).
9. `## Tests`: unit, repository, API; factories; the one happy path that asserts the whole response.
10. `## Glossary`: the CONTEXT.md terms added, reworded or retired.
11. `## ADR`: the ADR to write, or "Not needed" with the reason.
12. `## Done`: the deliverables: code with tests, migration, curl collection, CONTEXT.md, the draft for the project's API documentation, anything else.
13. `## Tier`: small | medium | large.

A Subtask's Description (2-4 sentences) ends with its position: "Fifth of nine subtasks of \"<parent title>\"."

## Layout of a parent Task with a breakdown

The parent's Specification is the shared design; it has no Goal, Tests or Done of its own:

1. `## Shared design`: one paragraph saying that Subtasks hold only their specifics and refer back here, and that decisions are on the Stream.
2. `### Why`: the customer's intent, the sources as markdown links, the reading rule (requirements over solutions), decisions made with the customer that override the sources.
3. `### Subtasks (implementation and merge order)`: numbered list `<project>/<number> <title>`.
4. One `###` section per shared concept: model blocks, rules in bullets.
5. `### <Policy>` sections for anything decided once for all Subtasks (migration policy, scoping rules).
6. `### Conventions`: repo rules to follow (AGENTS.md), the API conventions of the project's API documentation, the formatting rules below, the deliverables every Subtask owes.

The parent's Description says that its Specification holds the shared design and lists the Subtasks in order.

## Formatting

### Code blocks

* `` ```python model `` for pydantic / ORM shapes, `` ```sql model `` for DDL. The atui web UI renders these specially; never use a plain fence for a model.
* `` ```http `` for every endpoint: method and path alone on the line, in its own block; never inline in prose or in a heading.
* `` ```json `` for every request and response example: pretty-printed, one key per line. An excerpt is still valid JSON (wrap it in braces, no `…`).
* Wrap lines in model blocks at about 100 characters; break long index or constraint definitions after a comma.

### Bullets

* Query parameters, request fields, response field notes, headers and lists of changes are bullets, one item per bullet.
* Spell out role names, error codes and field names; never "same roles as X", "as today", "etc."; look roles up in the code.

### Endpoint template

````
### <doc number> <Audience>: <Name>
Role: <ROLE_A>, <ROLE_B>

<One or two sentences: what the endpoint does and what is special about it.>
#### Request
```http
<METHOD> /<path>
```
```json
{
  "<field>": "<example>"
}
```
- `<field>` <rule: required/optional, allowed values, validation>.
#### Response
Headers:
- Total-Count
- Total-Pages

Status: 200
```json
{
  "data": {
    "<field>": "<example>"
  }
}
```
- `<field>` <note: when omitted, what it means>.

Status: 404 — <when>

Status: 409 — <ERROR_CODE> (<when>)

Status: 422 — <ERROR_CODE> (<when>)
````

* The `Role:` line comes first and alone, then a blank line, then the description.
* `Headers:` (only when the endpoint has any) as bullets, before the first status.
* Every possible status is its own paragraph line, `Status: <code> — <code or reason> (<when>)`, separated by blank lines. Never bullets.
* The `Status: 200` line is followed by the JSON example and the field notes as bullets. Where the object is defined in another section, the reference goes on that line and belongs to the 200 only: `Status: 200 — Object of 14.1.` or ``Status: 200 — `data` is a list of the object of 14.1.``
* An error example (when the error carries `details`) sits under its own status line, followed by its field notes.
* Removed errors are listed as `Removed: 422 — <ERROR_CODE>`.
* Two 422s with different codes are two lines.

### Reference examples

Written by the user (atui Task agriverse/13). A create endpoint:

````
### 14.1 Admin: Create Geography
Role: CATALOG, ADMIN

Creates a geography on one of the three tiers.
#### Request
```http
POST /admin/v1/geographies
```
```json
{
  "name": "Lucknow",
  "tier": "REGION",
  "parent_id": "geo-uuid-up"
}
```
- `parent_id` is required for REGION and TERRITORY and must be a geography of the tier directly above; forbidden for STATE.
- `minimum_order_value` is optional and allowed for STATE only.
#### Response

Status: 200
```json
{
  "data": {
    "id": "geo-uuid-lko",
    "name": "Lucknow",
    "tier": "REGION",
    "parent_id": "geo-uuid-up",
    "path": [
      {
        "id": "geo-uuid-up",
        "name": "Uttar Pradesh",
        "tier": "STATE"
      }
    ],
    "created_at": "2026-10-20T10:00:00Z",
    "updated_at": "2026-10-20T10:00:00Z"
  }
}
```
- `path` lists the ancestors from the state down; empty for a STATE.
- `minimum_order_value` is omitted when null.

Status: 404 — parent not found

Status: 409 — GEOGRAPHY_NAME_EXISTS ("'Lucknow' already exists under 'Uttar Pradesh'")

Status: 422 — GEOGRAPHY_PARENT_TIER_MISMATCH (parent missing, not of the tier directly above, or given for a STATE)

Status: 422 — MINIMUM_ORDER_VALUE_NOT_ALLOWED (set on a non-STATE)
````

A list endpoint:

````
### 14.2 Admin: List Geographies
Role: ADMIN, CATALOG, ORDERS, FINANCE, HUB, MARKETING

Flat list sorted by name ascending, then id; the admin UI builds the tree from `parent_id`.
#### Request
```http
GET /admin/v1/geographies
```
Query parameters:
- `tier` (optional)
- `parent_id` (optional)
- `query` (optional, search by name)
- `page`, `page_size`
#### Response
Headers:
- Total-Count
- Total-Pages

Status: 200 — `data` is a list of the object of 14.1.
````

## Process

* Attach first, link second: no Specification references a source that is not an Artifact of that Task.
* Post each decision on the Stream as it is made; rewrite the Specification afterwards from the decisions.
* Comments the user posts on a Subtask reach only that Subtask's Agent; before asking for approval again, the parent Agent reads the Subtasks' Streams (`threads(task=…)`).
* Any new version of the Specification clears the approval; the final text goes on the Task before `approve()`.
