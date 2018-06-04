// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const togglApiClient = require('toggl-api');
const moment = require('moment');

const config = vscode.workspace.getConfiguration('');
const apiKey = config.get('toggl.apiKey');
const defaultProjectId = config.get('toggl.defaultProjectId');

if(!apiKey) {
    vscode.window.showErrorMessage("[Toggl] Api key not defined");
}
const togglClient = new togglApiClient({
    apiToken: apiKey
});

const statusBarClass = function() {
    this.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

    this.update = (val) => {
        this.bar.text = "[Toggl] - " + val.description;
        this.bar.show();
    }

    this.updateNoTask = () => {
        this.update({description: 'No task'});
    }
};

const statusBar = new statusBarClass();

const infoBox = {
    show : (timeEntry, action = '') => {
        const duration = timeEntry.duration ? moment.duration(Date.now() / 1000 + timeEntry.duration, 'second').humanize() : '';
        const description = timeEntry.description;
        const durationMessage = duration ? `(${duration})` : '';
        const message = `[Toggl] ${action} ${description} ${durationMessage}`;
        vscode.window.showInformationMessage(message);
    },
    showNoTask: () => {
        vscode.window.showInformationMessage( 'No task actually running');
    }
}

const togglApi = {
    start: () => {
        vscode.window.showInputBox({ 
            prompt: 'Task name ?',
        }).then((value) => {
            togglApi._start(value);
        });
    },    
    startExisting: () => {
        togglClient.getTimeEntries(undefined, undefined, (err, timeEntries) => {
            const items = timeEntries.map((t) => t.description).filter(distinct).filter(notNullOrEmpty);
            vscode.window.showQuickPick(items, {}).then((value) => {
                togglApi._start(value);
            })
        });
    },
    end: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            if(timeEntry) {
                return togglClient.stopTimeEntry(timeEntry.id, () => {
                    infoBox.show(timeEntry, 'stop');
                    statusBar.updateNoTask();
                });
            }
            togglApi._noTask();
        });
    },
    current: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            if(timeEntry) {
                return togglApi._refresh(timeEntry);
            }
            togglApi._noTask();
        });
    },
    _refresh: (timeEntry) => {
        infoBox.show(timeEntry);
        statusBar.update(timeEntry);
    },
    _noTask: () => {
        infoBox.showNoTask();
        statusBar.updateNoTask();
    },
    _start: (timeEntryName) => {
        if(!timeEntryName) {
            return togglApi._invalidTaskName();
        }
        const timeEntry = buildTimeEntry(timeEntryName);
        togglClient.startTimeEntry(timeEntry, () => {
            infoBox.show(timeEntry, 'start');
            statusBar.update(timeEntry);
        });
    },
    _invalidTaskName: () => {
        vscode.window.showErrorMessage("[Toggl] No task name");
        statusBar.updateNoTask();
        return;
    }
};

function buildTimeEntry(description) {
    return {
        description: description,
        pid: defaultProjectId
    };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('"vscode-toggl" is active!');

    let togglStart = vscode.commands.registerCommand('toggl.start', function () {
        togglApi.start();
    });

    let togglStartExisting = vscode.commands.registerCommand('toggl.startExisting', function () {
        togglApi.startExisting();
    });

    let togglEnd = vscode.commands.registerCommand('toggl.end', function () {
        togglApi.end();
    });

    let togglCurrent = vscode.commands.registerCommand('toggl.current', function () {
        togglApi.current();
    });

    let togglOpen = vscode.commands.registerCommand('toggl.open', function () {
        vscode.commands.executeCommand('vscode.open', vscode.Uri.parse("https://toggl.com/app/timer"));
    });

    togglApi.current();
    context.subscriptions.push(togglStart, togglStartExisting, togglEnd, togglCurrent, togglOpen);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function notNullOrEmpty(value) {
    return !!value;
}

function distinct(value, index, self) { 
    return self.indexOf(value) === index;
}
