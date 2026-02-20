---
name: curl
description: Update the curl collection for this project so it can be used for testing and debugging the API changes made on the current branch.
---
# Curl Collection (TEST Phase)

## Goal

Create or update curl commands that exercise the API endpoints changed on the current branch.

## Workflow

1. Read the branch diff to identify new/modified API endpoints.
2. Find the project's collection dir in `~/projects/testing/curl/<project>/` (project name = repo name).
3. Find or create the `.sh` file for the resource (see structure below).
4. Write curl commands following the format rules.

## Directory structure

```
~/projects/testing/curl/
├── .env                        # Shared secrets
├── auth.sh                     # Auth helpers (exports AUTH_TOKEN)
└── <project>/                  # One dir per project = repo name
    ├── <resource>.sh           # If API has no versioning
    └── <version>/              # If API is versioned (v1/, v2/, v3/)
        └── <resource>.sh
```

One file per resource group (e.g. `treatments.sh`, `surveys.sh`). Create subdirs for API versions only when the project's API uses version prefixes.

## Variables

| Variable | Purpose | Example |
|---|---|---|
| `${HOST}` | Base URL, no trailing slash, no version | `https://api.dingo.ag` |
| `${AUTH_TOKEN}` | Bearer token from `auth.sh` | — |

## Format rules

- Each command starts with a `### comment` describing the call
- One blank line before the `###`, one blank line after `| jq`
- Always pipe to `jq` (`jq .` for full output, or a filter expression)
- GET query params: use `-G` + `--data-urlencode` (readable & properly encoded)
- POST/PUT/PATCH bodies: use `--data '{...}'` with `-H "Content-Type: application/json"`
- Quote all variable interpolations: `"${HOST}"`, `"${AUTH_TOKEN}"`
- 4-space indent for continuation lines

### GET

```bash
### List treatments with filters

curl -X GET "${HOST}/v3/treatments" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -G \
    --data-urlencode "page_size=20" \
    --data-urlencode "crop_id=COTTON" \
| jq .
```

### POST

```bash
### Submit survey response

curl -X POST "${HOST}/v1/responses" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -H "Content-Type: application/json" \
    --data '{
        "survey_id": "purchase_factors",
        "answers": [{"question_id": "q1", "option_ids": ["a1"]}]
    }' \
| jq .
```
