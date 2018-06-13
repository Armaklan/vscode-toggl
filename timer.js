const MILLISECONDS_IN_SECOND = 1000;
const SECOND_IN_MINUTES = 60;
const POMODORO_END_TIME = 25 * SECOND_IN_MINUTES * MILLISECONDS_IN_SECOND;

module.exports = class Timer {

    /**
     * Build a new timer
     * @param tickCallback to call when tick. Function with 1 argument (countdown).
     */
    constructor (pomodoroActivated) {
        this.countdown = 0;
        this.pomodoroActivated = pomodoroActivated;
    }

    /**
     * Start the timer
     * @param initialValue (in millisecond)
     */
    start (initialValue  = 0, tickCallback = (countdown) => {}, pomodoroCallback = () => {}) {
        if(this._timer) {
            throw new Error("Timer is already started");
        }

        this.countdown = initialValue;
        this._pomodoroCallback = pomodoroCallback;
        this._tickCallback = tickCallback;

        this._timer = setInterval(() => {
            this._tick();
        }, MILLISECONDS_IN_SECOND)
    }

    /**
     * Stop the timer
     */
    stop () {
        if(this._timer) {
            clearInterval(this._timer);
            this._timer = undefined;
            this._tickCallback = undefined;
        }
    }

    
    /**
     * Stop and reset value of Timer
     */
    reset (initialValue  = 0) {
        this.stop();
        this.countdown = initialValue;
    }

    _tick () {
        this.countdown += MILLISECONDS_IN_SECOND;
        
        if(this.countdown >= POMODORO_END_TIME) {
            this._pomodoroCallback();
        } else {
            this._tickCallback(this.countdown);
        }
    }
}