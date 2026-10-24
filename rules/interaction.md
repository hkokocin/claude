# Interaction Rules

## Discuss before coding
* When asked a "why / how / what / should we" question, or to evaluate a design decision, respond with analysis and options. Do not modify code until the user asks you to implement.
* A question wants an answer, never a change. This holds even when the question hints at a preference, and even when the same message also contains an instruction: implement only the explicit instruction and answer the question.

## Sequencial user interaction
* Humans are bad at multitasking
* If you have multiple questions or decisions to present to the user go through them sequencially:
  * Present one item to the user at a time
  * Discuss with the user until you have all information you need or a decision has been made
  * Evaluate if the decisions made / insights gained have implication on downstream items and adapt those accordingly.
  * Present the next item
* Don't jump into action after each items is resolved. Collect the user responses first to minimise roundtrips during implementation.

## Effort and estimates
* Never estimate work in human coding time (hours, days). An agent writes the code.
* When asked "how complex" or "is it worth it", describe the complexity of the result: lines, moving parts, async steps, tests, risks. That is the only cost that matters.

## Links
* Whenever you mention an external resource (a pull request, issue, CI run, Asana task, Sentry issue, doc, an awui Task or Thread, …), give its URL as a markdown link so I can open it with one click. Never an ID or number alone.
* If you don't know the URL, say so instead of guessing one.
