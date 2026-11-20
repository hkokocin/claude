---
name: finish
description: Use once a change is merged and passed the dev test, where there is one, to update the curl collection and set the Task done.
---
# Finish

When it starts: /develop, Steps.

1. Backend work: make the curl collection match the merged endpoints (/curl).
2. Go through the Task's open Threads and resolve every one that is settled (/atui, Resolving), so that what stays open still needs someone. A Friend's Parent does it on the Subtask's Stream too.
3. Last, once everything else is done and pushed: set the Task to `done`; it retires you (/atui, Status).
