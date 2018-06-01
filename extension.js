// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const togglApiClient = require('toggl-api');
const togglClient = new togglApiClient({
    apiToken: "xx"
});

const togglApi = {
    start: () => {
        const timeEntry = {
            description: 'Task de test'
        }
        togglClient.startTimeEntry(timeEntry, () => {
            vscode.window.showInformationMessage("[Toggl] Démarrage d'une nouvelle tâche : " + timeEntry.description);
        });
    },
    end: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            if(timeEntry) {
                togglClient.stopTimeEntry(timeEntry.id, () => {
                    vscode.window.showInformationMessage("[Toggl] Arrêt de la tâche : " + timeEntry.description);        
                });
            } else {
                vscode.window.showErrorMessage("[Toggl] Aucun tâche en cours actuellement");
            }
        });
    },
    current: () => {
        togglClient.getCurrentTimeEntry((err, timeEntry) => {
            vscode.window.showInformationMessage("[Toggl] Tâche en cours : " + timeEntry.description);
        });
    }
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('"vscode-toggl" is active!');

    let togglStart = vscode.commands.registerCommand('toggl.start', function () {
        togglApi.start();
    });

    let togglEnd = vscode.commands.registerCommand('toggl.end', function () {
        togglApi.end();
    });

    let togglCurrent = vscode.commands.registerCommand('toggl.current', function () {
        togglApi.current();
    });

    context.subscriptions.push(togglStart, togglEnd, togglCurrent);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;