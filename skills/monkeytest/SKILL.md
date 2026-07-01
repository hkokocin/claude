---
name: monkeytest
description: Monkeytest the given service
---

# Monkeytest

If not explicitely instructed otherwise
* always target local env
* always test the endpoints that where changed on the current feature branch

## Preparation
* Fetch all remove changes.
* Is the current branch up to date with main? If not do /merge
* If testing locally
  * Is the local database running? If not docker-compose-up it. If that is blocked ask me to do it for you.
  * Is the local database up-to-date with existing migrations?
* Ingest the api spec
* if testing a feature branch let a subagent analyse the changes on the current branch and only return a list of affected endpoints

## Run Tests
* Monkeytest the endpoints in scope

