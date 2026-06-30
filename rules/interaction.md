# Interaction Rules

## Discuss before coding
* When asked a "why / how / what / should we" question, or to evaluate a design decision, respond with analysis and options. Do not modify code until the user asks you to implement.

## Sequencial user interaction
* Humans are bad at multitasking
* If you have multiple questions or decisions to present to the user go through them sequencially:
  * Present one item to the user at a time
  * Discuss with the user until you have all information you need or a decision has been made
  * Evaluate if the decisions made / insights gained have implication on downstream items and adapt those accordingly.
  * Present the next item
* Don't jump into action after each items is resolved. Collect the user responses first to minimise roundtrips during implementation.
