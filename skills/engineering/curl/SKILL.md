---
name: curl
description: Update the curl collection for this project so it can be used for testing and debugging the API changes made on the current branch.
---
# Curl Collection

Create or update the curl commands for the API endpoints changed on the current branch, so the user can test and debug them.

## Layout

```
~/projects/testing/curl/
├── .env                 # shared secrets
├── auth.sh              # auth helpers, exports AUTH_TOKEN
└── <project>/           # repo name
    ├── <resource>.sh    # API without versioning
    └── <version>/       # only if the API uses version prefixes (v1/, v2/)
        └── <resource>.sh
```

One file per resource group (e.g. `treatments.sh`). Variables: `${HOST}` is the base URL without trailing slash and without version (e.g. `https://api.dingo.ag`); `${AUTH_TOKEN}` comes from `auth.sh`.

## Format

Write every command like the examples:
* a `### comment` describing the call, blank lines around the command
* piped to `jq` (`jq .` or a filter)
* every query parameter, the optional ones commented out; GET parameters as `-G` with `--data-urlencode`
* bodies as `--data '{...}'` with a JSON content type
* variables quoted, continuation lines indented by 4 spaces

```bash
### List treatments with filters

curl -X GET "${HOST}/v3/treatments" \
    -H "Authorization: Bearer ${AUTH_TOKEN}" \
    -G \
    --data-urlencode "page_size=20" \
    --data-urlencode "crop_id=COTTON" \
    # --data-urlencode "is_optional=true" \
| jq .

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
