/**
 * Events that an ACC_Component can receive
 */
enum ACC_EventType {
    HOVER,
    PRESS,
    CLICK,
    RELEASE
}

/**
 * Component for AutoCanvas
 */
class ACC_Component {
    parent:                     AutoCanvas;
    x:                          ACC_Dynamic;
    y:                          ACC_Dynamic;
    render_ignore_translation:  boolean     = false;
    render_ignore_scaling:      boolean     = false;
    render_hoisted:             boolean     = false;
    render_base_scale:          ACC_Dynamic = new ACC_Dynamic(1);
    is_hovering:                boolean     = false;
    is_clicked:                 boolean     = false;

    on_resize:      (c: ACC_Component) => void = () => {
        this.x.fix();
        this.y.fix();
    };
    on_hover:       (c: ACC_Component) => void = () => {};
    on_hover_stop:  (c: ACC_Component) => void = () => {};
    on_press:       (c: ACC_Component) => void = () => {};
    on_click:       (c: ACC_Component) => void = () => {};
    on_release:     (c: ACC_Component) => void = () => {};

    /**
     * Constructs a new Component
     * @param parent    AutoCanvas that owns this component
     * @param x         X Position
     * @param y         Y Position
     */
    constructor(parent: AutoCanvas, x: number, y: number) {
        this.parent = parent;
        this.x = new ACC_Dynamic(x);
        this.y = new ACC_Dynamic(y);
    }

    /**
     * Tick every dynamic element
     * @param dt    ms elapsed
     */
    tick(dt: number): void {
        this.x.tick(dt);
        this.y.tick(dt);
        this.render_base_scale.tick(dt);
    };

    /**
     * Render component on screen
     * @param ctx       Canvas rendering context
     * @param transform Canvas transform states
     */
    refresh(ctx: CanvasRenderingContext2D, transform: ACC_TransformState): void {};

    /**
     * Recieves an event, checks collision, runs effects, and returns if successful
     * @param transform Transform data for canvas
     * @param x         X position to be checked
     * @param y         Y position to be checked
     * @param type      type of event
     * @param override  if set, will return
     * @return if (x,y) collides with this component
     */
    collide(transform: ACC_TransformState,
            x: number,
            y: number,
            type: ACC_EventType,
            override: boolean | undefined = undefined
    ): boolean {
        return false;
    };
}