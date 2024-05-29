"use strict";

class Handler {
    constructor(canvas) {
        this.canvas = canvas;

        this.arena = new Arena();

    }

    draw() {
        const context = this.canvas.getContext();
        this.arena.draw(context);
    }

    tick() {
        this.arena.tick();
    }
}