class ACC_Image extends ACC_Component {
    img: HTMLImageElement = new Image();
    render_centered: boolean = false;

    tick(dt: number): void {
        super.tick(dt);
        this.render_base_scale.tick(dt);
    };

    refresh(ctx: CanvasRenderingContext2D, transform: ACC_TransformState): void {
        ctx.drawImage(this.img,
            this.get_render_x(transform), this.get_render_y(transform),
            this.get_render_width(transform), this.get_render_height(transform)
        );
    }

    //<editor-fold desc="Render Dimensions">
    /**
     * Calculates rendered width of object
     * @param transform Transform State
     * @return render width
     */
    get_render_width(transform: ACC_TransformState): number {
        let width = this.img.width * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            width *= transform.scale;
        }
        return width;
    }

    /**
     * Calculates rendered height of object
     * @param transform Transform State
     * @return render height
     */
    get_render_height(transform: ACC_TransformState): number {
        let height = this.img.height * this.render_base_scale.get();
        if (!this.render_ignore_scaling) {
            height *= transform.scale;
        }
        return height;
    }

    /**
     * Calculates rendered x of object
     * @param transform Transform State
     * @return render x
     */
    get_render_x(transform: ACC_TransformState): number {
        if (this.render_ignore_translation) {
            return this.x.get();
        }
        let x = this.x.get() * transform.scale + transform.x;
        if (this.render_centered) {
            x -= this.get_render_width(transform) / 2;
        }
        return x;
    }

    /**
     * Calculates rendered y of object
     * @param transform Transform State
     * @return render y
     */
    get_render_y(transform: ACC_TransformState): number {
        if (this.render_ignore_translation) {
            return this.y.get();
        }
        let y = this.y.get() * transform.scale + transform.y;
        if (this.render_centered) {
            y -= this.get_render_height(transform) / 2;
        }
        return y;
    }
    //</editor-fold>

    /**
     * Recieves an event, checks collision, runs effects, and returns if successful
     * @param transform Transform data for canvas
     * @param client_x  X position to be checked
     * @param client_y  Y position to be checked
     * @param type      type of event
     * @param override  if set, will return
     * @return if (x,y) collides with this component
     */
    collide(transform: ACC_TransformState,
            client_x: number,
            client_y: number,
            type: ACC_EventType,
            override: boolean | undefined = undefined
    ): boolean {
        // Check collision
        let detected;
        if (override != undefined) {
            detected = override;
        } else {
            detected = (
                client_x > this.get_render_x(transform) &&
                client_x < this.get_render_x(transform) + this.get_render_width(transform) &&
                client_y > this.get_render_y(transform) &&
                client_y < this.get_render_y(transform) + this.get_render_height(transform)
            );
        }

        // Do action based on type
        switch (type) {
            case (ACC_EventType.HOVER): {
                if (detected && !this.is_hovering) {
                    this.is_hovering = true;
                    this.on_hover(this);
                } else if (!detected && this.is_hovering) {
                    this.is_hovering = false;
                    this.on_hover_stop(this);
                }
            } break;
            case (ACC_EventType.PRESS): {
                if (detected && !this.is_clicked) {
                    this.is_clicked = true;
                    this.on_press(this);
                }
            } break;
            case (ACC_EventType.CLICK): {
                if (detected) {
                    this.on_click(this);
                }
            } // Fall through on purpose
            case (ACC_EventType.RELEASE): {
                if (this.is_clicked) {
                    this.is_clicked = false;
                    this.on_release(this);
                }
            } break;
        }
        return detected;
    };
}