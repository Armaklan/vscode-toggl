// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const toggl = require('./toggl');
const infoBox = require('./infobox');

const config = vscode.workspace.getConfiguration('');
const apiKey = config.get('toggl.apiKey');
const defaultProjectId = config.get('toggl.defaultProjectId');
const pomodoroActivated = config.get('toggl.pomodoroActivated') || false;

const timer = new (require('./timer'))(pomodoroActivated);

if(!apiKey) {
    vscode.window.showErrorMessage("[Toggl] Api key not defined");
}
const togglCli = new toggl.client(apiKey);

const statusBar = new (require('./statusbar'))();


const commands = {
    start: () => {
        vscode.window.showInputBox({ 
            prompt: 'Task name ?',
        }).then((value) => {
            commands._start(value);
        });
    },    
    startExisting: () => {
        togglCli.all().then((items) => {
            vscode.window.showQuickPick(items.map((elt) => elt.description), {}).then((value) => {
                commands._start(value);
            });
        });
    },
    end: () => {
        togglCli.stopCurrent().then((timeEntry) => {
            if(timeEntry) {
                infoBox.show(timeEntry, 'stop');
            }
            commands._noTask();
        });
    },
    current: () => {
        togglCli.current().then((timeEntry) => {
            if(timeEntry) {
                return commands._refresh(timeEntry);
            }
            commands._noTask();
        })
    },
    _refresh: (timeEntry) => {
        infoBox.show(timeEntry);
        timer.stop();
        statusBar.update(timeEntry, timeEntry.duration);
        commands._startTimer(timeEntry);
    },
    _noTask: () => {
        timer.stop();
        infoBox.showNoTask();
        statusBar.updateNoTask();
    },
    _start: (timeEntryName) => {
        if(!timeEntryName) {
            return commands._invalidTaskName();
        }
        const timeEntry = buildTimeEntry(timeEntryName);
        togglCli.start(timeEntry).then(() => {
            commands._startTimer(timeEntry);
            infoBox.show(timeEntry, 'start');
        });
    },
    _startTimer: (timeEntry) => {
        timer.start(timeEntry.duration || 0, (time) => {
            statusBar.update(timeEntry, time);
        }, () => {
            commands.end();
            vscode.window.showWarningMessage("[Toggl] End of pomodoro. Please take a pause.");
        });
    },
    _invalidTaskName: () => {
        vscode.window.showErrorMessage("[Toggl] No task name");
        statusBar.updateNoTask();
        return;
    }
};

function buildTimeEntry(description) {
    return new toggl.TimeEntry(description, defaultProjectId);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('"vscode-toggl" is active!');

    let togglStart = vscode.commands.registerCommand('toggl.start', function () {
        commands.start();
    });

    let togglStartExisting = vscode.commands.registerCommand('toggl.startExisting', function () {
        commands.startExisting();
    });

    let togglEnd = vscode.commands.registerCommand('toggl.end', function () {
        commands.end();
    });

    let togglCurrent = vscode.commands.registerCommand('toggl.current', function () {
        commands.current();
    });

    let togglOpen = vscode.commands.registerCommand('toggl.open', function () {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse("https://toggl.com/app/timer"));
    });

    commands.current();
    context.subscriptions.push(togglStart, togglStartExisting, togglEnd, togglCurrent, togglOpen);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
