/**
 * Easing types for instances of ACC_Task
 */
enum ACC_EaseType {
    LINEAR
}

/**
 * Class used by ACC_Dynamic to smoothly edit value
 */
class ACC_Task {
    private readonly delta:     number;
    private readonly max_ms:    number;
    private readonly ease_type: ACC_EaseType;
    private          cur_ms:    number          = 0;

    /**
     * Creates a task to change a variable over time
     * @param delta     Desired change in variable
     * @param ms        Milliseconds elapsed
     * @param ease_type Easing type
     */
    constructor(delta: number, ms: number, ease_type: ACC_EaseType) {
        this.delta = delta;
        this.max_ms = ms;
        this.ease_type = ease_type;
    }

    /**
     * Modifies value of target variable based on change in time
     * @param target    Target variable to change
     * @param dt        Change in time
     */
    public tick(target: ACC_Dynamic, dt: number): void {
        switch (this.ease_type) {
            case (ACC_EaseType.LINEAR): {
                this.cur_ms += dt;
                target.set(target.get() + this.delta * (dt / this.max_ms));
            } break;
        }
    }

    /**
     * @return if task is dead
     */
    public is_dead(): boolean {
        return this.cur_ms >= this.max_ms;
    }
}