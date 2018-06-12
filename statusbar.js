const vscode = require('vscode');
const moment = require('moment');
const momentDurationFormatSetup = require("moment-duration-format");
momentDurationFormatSetup(moment);

module.exports = class StatusBar {

    constructor() {
        this.bar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    }
    
    update (val, time = undefined) {
        if(time) {
            const duration = moment.duration(time);
            this.bar.text = "[ " + duration.format("h:m:s") + "] [Toggl] - " + val.description;
        } else {
            this.bar.text = "[Toggl] - " + val.description;
        }        
        this.bar.show();
    }

    updateNoTask () {
        this.update({description: 'No task'});
    }

}