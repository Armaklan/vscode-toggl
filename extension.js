// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const togglApiClient = require('toggl-api');
const moment = require('moment');

const config = vscode.workspace.getConfiguration('');
const apiKey = config.get('toggl.apiKey');

if(!apiKey) {
    vscode.window.showErrorMessage("[Toggl] Api key not defined");
}
const togglClient = new togglApiClient({
    apiToken: apiKey
});

const statusBarClass = function() {
    this.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);

    this.update = (val) => {
        this.bar.text = "[Toggl] - " + val;
        this.bar.show();
    }
};

const statusBar = new statusBarClass();

const togglApi = {
    start: () => {
        vscode.window.showInputBox({
            prompt: 'Nom de votre tâche ?',
        }).then((value) => {
            const timeEntry = {
                description: value
            }
            togglClient.startTimeEntry(timeEntry, () => {
                vscode.window.showInformationMessage("[Toggl] Start new task : " + timeEntry.description);
                statusBar.update(timeEntry.description);
            });
        })
    },    
    startExisting: () => {
        togglClient.getTimeEntries(undefined, undefined, (err, timeEntries) => {
            const items = timeEntries.map((t) => t.description).filter(distinct);
            vscode.window.showQuickPick(items, {}).then((value) => {
                const timeEntry = {
                    description: value
                }
                togglClient.startTimeEntry(timeEntry, () => {
                    vscode.window.showInformationMessage("[Toggl] Restart existing task : " + timeEntry.description);
                    statusBar.update(timeEntry.description);
                });
            })
        });
    },
    end: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            if(timeEntry) {
                togglClient.stopTimeEntry(timeEntry.id, () => {
                    showTimeEntryInformation(timeEntry, 'stop');
                    statusBar.update('No task');      
                });
            } else {
                vscode.window.showErrorMessage("[Toggl] No task actually running");
                statusBar.update('No task');
            }
        });
    },
    current: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            if(timeEntry) {
                showTimeEntryInformation(timeEntry); 
                statusBar.update(timeEntry.description);
            } else {
                vscode.window.showInformationMessage("[Toggl] No task actually running");
                statusBar.update('No task');
            }
        });
    }
};

function showTimeEntryInformation(timeEntry, action = '') {
    const duration = moment.duration(Date.now() / 1000 + timeEntry.duration, 'second').humanize();
    const description = timeEntry.description;
    const message = `[Toggl] ${action} ${description} (${duration})`;
    vscode.window.showInformationMessage(message);
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

    togglApi.current();
    context.subscriptions.push(togglStart, togglStartExisting, togglEnd, togglCurrent);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;

function distinct(value, index, self) { 
    return self.indexOf(value) === index;
}
