--
name: review-comments
description: Process review comments and feedback.
---
# Process Review Comments 

* Ingest all unresolved review comments on the github PR.
* Verify the validity of each comment. Is it a valid comment? Is it actionable? Is it a question, suggestion, or request for change?
* For changes requests search for more occurances of the same issue in the codebase.
* Prepare a list of actions you would take to address each comment. For example, if a comment is a question, you might prepare an answer. If it's a suggestion, you might prepare a plan for how to implement it.
* Get the user's approval on the proposed actions before processing.
* Add a :thumbsup: reaction to comments we agree with and plan to address.
* For questions that require a response and comments we disagree with prepare a response but do NOT post it - it is my responsibility to reply to comments. 
* Implement the approved actions one after the other. 
* Create a commit for each code change made in response to a comment.
* After processing the comments resolve the conversation it belongs to.
* Do NOT push. Leave that to the user.
