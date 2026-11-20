---
name: cleanup
description: Remove a retired Agent's local resources - its Leases, containers and a still running app. Run by the Orchestrator for every retired Agent.
---
# Cleanup

For the Agent `<project>/<number>` named in the retire notice:
1. Release every Lease (/agent_database) it left behind: `atui resources release --prefix <project>_<number>_`. Besides its databases, Redis databases and buckets, this removes the containers its runs started and named after it, and their image tags.
2. Stop an app it still runs: the `app` window of its tmux session, if the session still exists.

Cleanup may run twice; resources already gone are fine. Leave the dev database and dev services alone.
