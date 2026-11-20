---
name: update_check
description: Use when dependencies were updated or are about to be - reads the release notes from the current to the new version for breaking changes and deprecations and assesses what they mean for the code.
---
# Update Check

* Determine which libraries have been updated.
* Check the release notes for each updated library to identify any breaking changes or deprecations.
  * make sure to check all release notes from current version to updated version.
* Analyse the codebase to see if any of the breaking changes or deprecations will affect our code.
  * If there are potential compatibility issues, investigate how to address them (e.g. code changes, configuration updates, etc.)
* Summarize your findings and give an assessment of the impact of resolving breaking changes.
