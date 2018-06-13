const MILLISECONDS_IN_SECOND = 1000;

module.exports = class Timer {

    /**
     * Build a new timer
     * @param tickCallback to call when tick. Function with 1 argument (countdown).
     */
    constructor () {
        this.countdown = 0;
    }

    /**
     * Start the timer
     * @param initialValue (in millisecond)
     */
    start (initialValue  = 0, tickCallback = (countdown) => {}) {
        if(this._timer) {
            throw new Error("Timer is already started");
        }

        this.countdown = initialValue;
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
        this._tickCallback(this.countdown);
    }
}