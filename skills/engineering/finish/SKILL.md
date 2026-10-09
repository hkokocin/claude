---
name: finish
description: Wrap up a merged change - curl collection and Task status.
---
# Finish

1. Backend work: make the curl collection match the merged endpoints (/curl).
2. Set the Task's status to `on-dev` (/atui). A Parent Task only moves once its last Friend's change passed the dev test (or is merged, where there is none).
