---
name: specification
description: The structure and formatting of an atui Task Specification - sections of a Task and of a parent with a breakdown, sources as Artifacts and links, model code blocks, the endpoint section template. Used by /refinement.
---
# Specification

How a Specification (/atui, Description and Specification) is built and formatted. /refinement writes it from the decisions on the Stream.

## Principles

1. **Requirements over solutions.** Read the customer's sources for the required outcome, not the solution they propose, which may be needlessly complex. Where the Specification departs from a source, say so inline ("Decision: …"); the reason stays on the Stream.
2. **The Stream holds the decisions, the Specification what follows from them.** It states; it doesn't argue.
3. **One source of truth.** Replace it as a whole. Shared design lives once, in the Parent; Subtasks hold only their own content.
4. **Written for Agents, readable by humans**: precise enough to implement without reopening settled questions, with sources linked so an Agent can verify.
5. **Pasteable drafts.** Where the project has its own API documentation (e.g. one the Agent can't write), endpoint sections follow its numbering and format exactly, so the user can paste them.

## Sources

* Every source (document, sheet, PDF, ticket, design, issue) is attached as an Artifact to the Task and to every Subtask before it is referenced (/atui, Artifacts). A Subtask's own pull request, ticket or design is no source and stays on the Subtask.
* A source is a markdown link on a short noun (`[tracking sheet](url)`), never a bare URL or an ID alone. Requirements cite their place in it: scenario id and page (`ADM-GEO-01..05, p. 3`), sheet tab, doc section.

## Layout of a Task or Subtask

A Subtask starts with one pointer line: "Shared design: the Specification of the parent Task <project>/<number> "<title>" holds <what>. Read it first; it applies here in full." Its Description (2-4 sentences) ends with its position: "Fifth of nine subtasks of "<parent title>"."

Sections in this order; leave out those that don't apply, never leave one empty:

`# <Title>` (a Subtask: `# Subtask <n>: <title>`), `## Goal` (2-4 sentences, the end state), `## Requirements (customer)` (bullets, each citing its source, `Decision: …` where it overrides it), `## Data model` (model blocks; pure functions with their signatures), `## Repository and service` or `## Behaviour` (numbered where order matters, and what disappears), `## Designs`, `## API` or `## API changes`, `## Errors` (new, changed, removed codes with their status), `## Migration` (what it creates, backfills, drops; the policy that applies), `## Tests` (unit, repository, API; factories; the one happy path asserting the whole response), `## Glossary` (CONTEXT.md terms added, reworded, retired), `## ADR` (or "Not needed" and why), `## Done` (all deliverables: code with tests, migration, curl collection, CONTEXT.md, API documentation draft, …), `## Tier`.

* **Designs**: one bullet per Design, its name in bold and the screen it shows (`- **Task Page**: the Task with its Stream and Artifacts.`). No approved version: a new version would otherwise change the Specification. A Subtask lists the Parent's Designs it builds, saying they are on the Parent.
* **API**: one section per endpoint in the template below; a changed endpoint lists only what changes. The heading carries the section number of the project's API documentation, new numbers continuing it.

## Layout of a Parent with a breakdown

Its Specification is the shared design, with no Goal, Tests or Done: `## Shared design` (Subtasks hold only their specifics and refer back here; decisions are on the Stream), `### Why` (the customer's intent, sources, the reading rule, decisions that override the sources), `### Subtasks (implementation and merge order)` (numbered `<project>/<number> <title>`), one `###` per shared concept, `### Designs` (each with the Subtask that builds it), `### <Policy>` for what is decided once for all Subtasks, `### Conventions` (repo rules, API conventions, these formatting rules, the deliverables every Subtask owes). Its Description says the Specification holds the shared design and lists the Subtasks in order.

## Formatting

* `` ```python model `` for pydantic / ORM shapes, `` ```sql model `` for the DDL of every new or changed table: the atui web UI renders these specially, a plain fence loses that. Wrap model lines at about 100 characters.
* `` ```http `` for every endpoint, method and path alone in their own block, never in prose or a heading.
* `` ```json `` for every request and response example, pretty-printed, one key per line; an excerpt is still valid JSON (no `…`).
* Query parameters (under `Query parameters:`), request fields, response field notes, headers and lists of changes are bullets, one item each.
* Spell out role names, error codes and field names (look roles up in the code); never "same roles as X", "as today", "etc.".

### Endpoint template

````
### <doc number> <Audience>: <Name>
Role: <ROLE_A>, <ROLE_B>

<One or two sentences: what it does and what is special about it.>
#### Request
```http
<METHOD> /<path>
```
```json
{
  "<field>": "<example>"
}
```
- `<field>` <required/optional, allowed values, validation>.
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
- `<field>` <when omitted, what it means>.

Status: 404 — <when>

Status: 422 — <ERROR_CODE> (<when>)
````

* `Role:` comes first and alone; `Headers:` only when there are any, before the first status.
* Every status is its own paragraph line, `Status: <code> — <code or reason> (<when>)`, never a bullet; two 422s with different codes are two lines. An error carrying `details` gets its example under its own status line.
* An object defined in another section is referenced on the 200 line: `Status: 200 — Object of 14.1.` or ``Status: 200 — `data` is a list of the object of 14.1.``
* Removed errors: `Removed: 422 — <ERROR_CODE>`.

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
