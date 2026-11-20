---
name: finish
description: Wrap up a merged change - curl collection and Task status.
---
# Finish

## Goal

Leave nothing behind after the merge: the curl collection matches main and the Task is `done`.

## Starts / ends

Starts after the dev test passed, or after the merge where there is no dev system (/develop). A Parent starts only once its last Friend's change got there. Ends with `done`.

## Status

`done`, as the last act: it retires the Agent (/atui, Status).

## Approval

None.

## Instructions

1. Backend work: make the curl collection match the merged endpoints (/curl).
2. Set the Task to `done` once everything else is done and pushed.
