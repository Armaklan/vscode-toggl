// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const toggl = require('./toggl');
const moment = require('moment');

const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

const timer = new (require('./timer'))();

const config = vscode.workspace.getConfiguration('');
const apiKey = config.get('toggl.apiKey');
const defaultProjectId = config.get('toggl.defaultProjectId');

if(!apiKey) {
    vscode.window.showErrorMessage("[Toggl] Api key not defined");
}
const togglCli = new toggl.client(apiKey);

const statusBarClass = function() {
    this.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

    this.update = (val, time = undefined) => {
        if(time) {
            const duration = moment.duration(time);
            this.bar.text = "[ " + duration.format("h:m:s") + "] [Toggl] - " + val.description;
        } else {
            this.bar.text = "[Toggl] - " + val.description;
        }        
        this.bar.show();
    }

    this.updateNoTask = () => {
        this.update({description: 'No task'});
    }
};

const statusBar = new statusBarClass();

const infoBox = {
    show : (timeEntry, action = '') => {
        const duration = timeEntry.duration ? moment.duration(timeEntry.duration).humanize() : '';
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
        togglCli.all().then((items) => {
            vscode.window.showQuickPick(items.map((elt) => elt.description), {}).then((value) => {
                togglApi._start(value);
            });
        });
    },
    end: () => {
        togglCli.stopCurrent().then((timeEntry) => {
            if(timeEntry) {
                infoBox.show(timeEntry, 'stop');
            }
            togglApi._noTask();
        });
    },
    current: () => {
        togglCli.current().then((timeEntry) => {
            if(timeEntry) {
                return togglApi._refresh(timeEntry);
            }
            togglApi._noTask();
        })
    },
    _refresh: (timeEntry) => {
        infoBox.show(timeEntry);
        timer.stop();
        statusBar.update(timeEntry, timeEntry.duration);
        timer.start(timeEntry.duration, (time) => {
            statusBar.update(timeEntry, time);
        });
    },
    _noTask: () => {
        timer.stop();
        infoBox.showNoTask();
        statusBar.updateNoTask();
    },
    _start: (timeEntryName) => {
        if(!timeEntryName) {
            return togglApi._invalidTaskName();
        }
        const timeEntry = buildTimeEntry(timeEntryName);
        togglCli.start(timeEntry).then(() => {
            timer.start(0, (time) => {
                statusBar.update(timeEntry, time);
            });
            infoBox.show(timeEntry, 'start');
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
