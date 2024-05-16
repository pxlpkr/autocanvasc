/**
 * Class representing a number that can be modified by ACC_Task classes,
 *
 */
class ACC_Dynamic {
    raw:        number;
    callback:   (() => number) | null   = null;
    tasks:      ACC_Task[]              = [];

    constructor(value: number) {
        this.raw = value;
    }

    /**
     * Sets value to number or links to callback
     * @param value number or callback to set to value
     */
    set(value: number | (() => number)): void {
        if (typeof(value) == "number") {
            this.raw = value;
        } else {
            this.callback = value;
            this.fix();
        }
    }

    /**
     * Gets value of this variable
     */
    get(): number {
        return this.raw;
    }

    /**
     * Updates raw value based on value of callback
     */
    fix(): void {
        if (this.callback) {
            this.raw = this.callback();
        }
    }

    /**
     * Adds a task to this variable
     * @param task  task to be added
     */
    addTask(task: ACC_Task): void {
        this.tasks.push(task);
    }

    /**
     * Modifies value based on all tasks
     * @param dt        Change in time
     */
    tick(dt: number): void {
        for (const task of this.tasks) {
            task.tick(this, dt);
            if (task.is_dead()) {
                this.tasks.splice(this.tasks.indexOf(task), 1);
            }
        }
    }
}