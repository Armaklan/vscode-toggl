const TogglApiClient = require('toggl-api');
const moment = require('moment');

class TogglClient {

    constructor(apiToken) {
        this.api = new TogglApiClient({
            apiToken: apiToken
        });
    }

    current() {
        return new Promise((resolve, reject) => {
            this.api.getCurrentTimeEntry((err, togglEntry) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(mapToTimeEntry(togglEntry));
                return;
            });
        });
    }

    start(timeEntry) {
        return new Promise((resolve, reject) => {
            const togglEntry = mapToToggleEntry(timeEntry);
            this.api.startTimeEntry(togglEntry, (err, resultEntry) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(mapToTimeEntry(resultEntry));
                return;
            });
        });
    }

    stop(timeEntry) {
        return new Promise((resolve, reject) => {
            const id = timeEntry.id;
            this.api.stopTimeEntry(id, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve();
                return;
            });
        });
    }

    stopCurrent() {
        return this.current().then((entry) => {
            this.stop(entry).then(() => entry);
        });
    }

    all() {
        return new Promise((resolve, reject) => {
            this.api.getTimeEntries(undefined, undefined, (err, togglEntries) => {
                if(err) {
                    reject(err);
                    return;
                }

                if(togglEntries === []) {
                    resolve([]);
                    return;
                }
                
                const entries = togglEntries.map(mapToTimeEntry).filter(notNullDescription).filter(distinct);
                resolve(entries);
                return;
            });
        });
    }
}

class TimeEntry {
    constructor(description, pid = undefined, id = undefined, duration = 0) {
        this.id = id;
        this.description = description;
        this.duration = duration;
        this.projectId = pid;
    }
    
    formatToHuman() {
        if(!this.duration) {
            return '';
        }
        return moment.duration(this.duration).humanize();
    }

}


function distinct(value, index, self) { 
    return self.findIndex((elt) => elt.description === value.description) === index;
}

function notNullDescription(entry) {
    return !!(entry && entry.description);
}

function mapToToggleEntry(timeEntry) {
    return {
        description: timeEntry.description,
        pid: timeEntry.projectId
    };
}

function mapToTimeEntry(togglEntry) {
    if(!togglEntry) {
        return undefined;
    }

    return new TimeEntry(
        togglEntry.description,
        togglEntry.pid,
        togglEntry.id,
        calculDurationFromTogglEntryInMillisecond(togglEntry)
    );
}

function calculDurationFromTogglEntryInMillisecond(togglEntry) {
    if(!togglEntry.duration) {
        return 0;
    }
    return Math.floor(((Date.now() / 1000 + togglEntry.duration) * 1000));
}


exports.client = TogglClient;
exports.TimeEntry = TimeEntry;