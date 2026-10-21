---
name: cleanup
description: Remove an Agent's local resources - its own database and anything else it started. Run by the Agent as its last step, and by the Orchestrator for every retired Agent.
---
# Cleanup

For the Agent `<project>/<number>` (yourself, or the one named in the retire notice):
1. Release its Leases (/agent_database) that crashed runs left behind: `atui resources release --prefix <project>_<number>_`. It drops the Agent's databases, Redis databases and buckets on the shared containers and stops the containers left empty.
2. Stop an app it still runs (the `app` window of its session, if the session still exists).

Resources that are already gone are fine: cleanup may run twice. Never touch the dev database or dev services.
