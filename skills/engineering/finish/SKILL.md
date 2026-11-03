---
name: finish
description: Wrap up a merged change - curl collection and Task status.
---
# Finish

1. Backend work: make the curl collection match the merged endpoints (/curl).
2. Set the Task's status to `done` (/atui): after the dev test passed, or after the merge where there is no dev system. A Parent Task only moves once its last Friend's change passed the dev test (or is merged, where there is none).
