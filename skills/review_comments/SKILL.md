--
name: review-comments
description: Process review comments and feedback.
---
# Process Review Comments 

* Ingest all unresolved review comments on the github PR.
* Verify the validity of each comment. Is it a valid comment? Is it actionable? Is it a question, suggestion, or request for change?
* Prepare a list of actions you would take to address each comment. For example, if a comment is a question, you might prepare an answer. If it's a suggestion, you might prepare a plan for how to implement it.
* Get the user's approval on the proposed actions before processing.
  * comments by the user themselves don't need approval if you agree that is points out an issue.
* Add a :thumbsup: reaction to comments we agree with and plan to address.
* For questions that require a response and comments we disagree with 
  * If the comment is from Copilot then reply and resolve the thread.
  * if the comment is from a team member prepare a response but leave it up to me to post it.
* Implement the approved actions one after the other. 
* Create a commit for each code change made in response to a comment.
* After processing the comments resolve the conversation (DON'T hide the comment).
* Push the changes after all comments have been processed.
* Update the PR description if necessary.

