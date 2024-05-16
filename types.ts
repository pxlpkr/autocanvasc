/**
 * Encapsulates transform data for an AutoCanvas
 */
class ACC_TransformState {
    x: number;
    y: number;
    buffered_x: number;
    buffered_y: number;
    scale: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.buffered_x = 0;
        this.buffered_y = 0;
        this.scale = 1;
    }
}

/**
 * Encapsulates mouse data for an AutoCanvas
 */
class ACC_MouseState {
    x: number;
    y: number;
    pressed_x: number;
    pressed_y: number;
    pressed: boolean;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.pressed_x = 0;
        this.pressed_y = 0;
        this.pressed = false;
    }
}