# vscode-toggl README

Toggl.com integration on vscode.

## Features

* `toggl.start` : Start a new task on toggl (with an input for description).
* `toggl.startExisting` : Start a task on toggl (with an autocomplete for description which recents task proposed).
* `toggl.end` : Stop current timer and show current task information.
* `toggl.current` : Show current task information.
* `toggl.open` : Open toggl.com in browser

In status bar (on right), the current task is visible.

### Pomodoro mode

The pomodoro mode can be activated with `toggl.pomodoro` configuration.
When use pomodoro mode, when 25 min haves passed :
- The task is ended
- A warning show `End of pomodoro. Please take a pause.`

## Extension Settings

This extension contributes the following settings:

* `toggl.apiKey`: API Key of your toggl account
* `toggl.defaultProjectId`: Project ID to attach all new task.
* `toggl.pomodoro`: Activate pomodoro mode.

