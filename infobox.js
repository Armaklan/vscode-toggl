const vscode = require('vscode');

module.exports = {
    show : (timeEntry, action = '') => {
        const duration = timeEntry.formatToHuman();
        const description = timeEntry.description;
        const durationMessage = duration ? `(${duration})` : '';
        const message = `[Toggl] ${action} ${description} ${durationMessage}`;
        vscode.window.showInformationMessage(message);
    },
    showNoTask: () => {
        vscode.window.showInformationMessage( 'No task actually running');
    }
}
