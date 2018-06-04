# vscode-toggl README

Toggl.com integration on vscode.

## Features

* `toggl.start` : Start a new task on toggl (with an input for description).
* `toggl.startExisting` : Start a task on toggl (with an autocomplete for description which recents task proposed).
* `toggl.end` : Stop current timer and show current task information.
* `toggl.current` : Show current task information.
* `toggl.open` : Open toggl.com in browser

In status bar (on right), the current task is visible.

## Extension Settings

This extension contributes the following settings:

* `toggl.apiKey`: API Key of your toggl account
* `toggl.defaultProjectId`: Project ID to attach all new task.

## Release Notes

### 0.0.1

Initial release : start/end/show current task.

### 0.0.2

Add duration on entry information (on current and stop task).

### 0.0.3

Add default project id to attach new task.
Add open toggl in browser.