# IDE Rules

* When you show the user code or talk about a particular place in a file (a review finding, an explanation, a proposed change, a question about a line), open it in the code pane: run `ide_show <file> <first line> <last line>` with the Bash tool, once per place you talk about. Pass the path relative to the working directory.
* Don't call it for files you only read for yourself, or for every file you touch.
* Run `ide_hide` when the user asks for it or once the conversation has moved away from the code.
* Only inside tmux (`$TMUX` set) and where `ide_show` exists; otherwise skip it silently.
* If `ide_show` fails, mention the error once and go on without it.
