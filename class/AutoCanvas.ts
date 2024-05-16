/**
 * HTML DOM Canvas manager
 */
class AutoCanvas {
    private readonly SCALE_STRENGTH = 1.0005;
    private readonly SCALE_MIN = 0.1;
    private readonly SCALE_MAX = 15;
    private readonly ENABLE_DEBUG = true;

    // PID of Interval Render Loop
    private render_loop_pid: number;
    // Canvas object on DOM
    private canvas: HTMLCanvasElement = wrap(document.createElement('canvas'))
        .set('className', 'autoCanvas')
        .pipe(document.body.appendChild.bind(document.body))
        .unwrap();
    // Mouse state
    private mouse_state: ACC_MouseState = new ACC_MouseState();
    // Transform state
    private transform: ACC_TransformState = new ACC_TransformState();

    public ctx: CanvasRenderingContext2D = (this.canvas.getContext('2d') as CanvasRenderingContext2D);

    //<editor-fold desc="Initialization">
    /**
     * Build an AutoCanvas
     */
    constructor() {
        this.correctDimensions();
        this.registerEventListeners();

        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }

    /**
     * Registers event listeners that the canvas will hook to
     */
    registerEventListeners() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.mouse_state.pressed = true;
            this.mouse_state.pressed_x = event.x;
            this.mouse_state.pressed_y = event.y;
            this.transform.buffered_x = this.transform.x;
            this.transform.buffered_y = this.transform.y;

            /* on_click */
            let found = false;
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, ACC_EventType.PRESS, found)) {
                    found = true;
                }
            }
        });

        document.addEventListener("mouseup", (event) => {
            if (this.mouse_state.pressed) {
                this.mouse_state.pressed = false;
            }

            /* on_release */
            let found = false;
            let drag_distance = ((this.mouse_state.pressed_x - event.x) ** 2 + (this.mouse_state.pressed_y - event.y) ** 2) ** 0.5;
            let event_type = drag_distance < 5 ? ACC_EventType.CLICK : ACC_EventType.RELEASE
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, event_type, found)) {
                    found = true;
                }
            }
        });

        document.addEventListener("mousemove", (event) => {
            this.mouse_state.x = event.x; // Potentially unneeded
            this.mouse_state.y = event.y;
            if (this.mouse_state.pressed) {
                this.transform.x = this.transform.buffered_x
                    + event.x
                    - this.mouse_state.pressed_x;
                this.transform.y = this.transform.buffered_y
                    + event.y
                    - this.mouse_state.pressed_y;
            }

            /* on_hover */
            let found = false;
            for (let i = this.components.length - 1; i >= 0; i--) {
                if (this.components[i].collide(this.transform, event.x, event.y, ACC_EventType.HOVER, found)) {
                    found = true;
                }
            }
        });

        window.addEventListener("resize", (event) => {
            this.correctDimensions();
            this.refresh();
            for (const comp of this.components) {
                comp.on_resize(comp);
            }
        });

        this.canvas.addEventListener("wheel", (event) => {
            this.zoom(event.deltaY, event.x, event.y);
        });
    }

    /**
     * Fixes dimensions of the DOM Canvas
     */
    correctDimensions(): void {
        let ctx = this.canvas.getBoundingClientRect();
        this.canvas.width = ctx.width;
        this.canvas.height = ctx.height;
        this.ctx.imageSmoothingEnabled = false;
    }
    //</editor-fold>

    //<editor-fold desc="Components">
    private _components_civilian: ACC_Component[] = [];
    private _components_priority: ACC_Component[] = [];

    /**
     * Returns current components, with priority components after standard
     * @return components list
     */
    public get components(): ACC_Component[] {
        return ([] as ACC_Component[]).concat(this._components_civilian, this._components_priority);
    }

    /**
     * Adds a component to the canvas
     * @param component Component to be added
     */
    addComponent(component: ACC_Component): void {
        if (component.render_hoisted) {
            this._components_priority.push(component);
        } else {
            this._components_civilian.push(component);
        }
    }

    //</editor-fold>

    //<editor-fold desc="Target FPS">
    private _target_fps: number = 60;

    /**
     * Returns target fps
     */
    public get target_fps() {
        return this._target_fps;
    }

    /**
     * Sets the target fps to a desired value
     * @param value Desired FPS value
     */
    public set target_fps(value: number) {
        this._target_fps = value;
        clearInterval(this.render_loop_pid);
        this.render_loop_pid = setInterval(this.refresh.bind(this), 1000 / this.target_fps);
    }
    //</editor-fold>

    //<editor-fold desc="Zooming">
    /**
     * Zooms in on canvas based on screen coordinates
     * @param amount    Amount to zoom
     * @param about_x   Screen X position to scale around
     * @param about_y   Screen Y position to scale around
     */
    zoom(amount: number, about_x: number, about_y: number) {
        const SCALE_AMT_MAX = this.SCALE_MAX / this.transform.scale;
        const SCALE_AMT_MIN = this.SCALE_MIN / this.transform.scale;

        let scaleAmount = Math.pow(this.SCALE_STRENGTH, -amount);
        scaleAmount = Math.max(Math.min(scaleAmount, SCALE_AMT_MAX), SCALE_AMT_MIN);

        this.raw_zoom(scaleAmount, about_x, about_y)
    }

    /**
     * Zooms in on canvas based on internal coordinates
     * @param amount    Amount to zoom
     * @param about_x   Internal X position to scale around
     * @param about_y   Internal Y position to scale around
     */
    raw_zoom(amount: number, about_x: number, about_y: number) {
        this.transform.scale *= amount;
        this.transform.scale = Math.max(Math.min(this.transform.scale, this.SCALE_MAX), this.SCALE_MIN);
        this.transform.x = (this.transform.x) * amount - about_x * (amount-1);
        this.transform.y = (this.transform.y) * amount - about_y * (amount-1);
    }
    //</editor-fold>

    private render_time: number = 0;

    /**
     * Draw to screen
     */
    refresh() {
        // Measure render time
        let perf_start: number = performance.now();

        // Render scene
        for (const component of this.components) {
            component.tick(1000 / this.target_fps);
        }
        this.ctx.fillStyle = "#292929";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const component of this.components) {
            component.refresh(this.ctx, this.transform);
        }

        // Measure render time
        this.render_time = performance.now() - perf_start;

        // Debug info
        if (this.ENABLE_DEBUG) {
            this.ctx.font = "18px futura";

            this.ctx.fillStyle = "black";
            this.ctx.fillText("Target MS: " + (1000 / this.target_fps).toFixed(0), 2, 22);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Target MS: " + (1000 / this.target_fps).toFixed(0), 0, 20);

            this.ctx.fillStyle = "black";
            this.ctx.fillText("Current MS: " + (this.render_time), 2, 42);
            this.ctx.fillStyle = "white";
            this.ctx.fillText("Current MS: " + (this.render_time), 0, 40);

            let r_mouse_x = Math.round((this.mouse_state.x - this.transform.x) / this.transform.scale);
            let r_mouse_y = Math.round((this.mouse_state.y - this.transform.y) / this.transform.scale);
            this.ctx.fillStyle = "black";
            this.ctx.fillText(`Looking at: (${r_mouse_x}, ${r_mouse_y})`, 2, 62);
            this.ctx.fillStyle = "white";
            this.ctx.fillText(`Looking at: (${r_mouse_x}, ${r_mouse_y})`, 0, 60);
        }
    }
}