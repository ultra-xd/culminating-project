"use strict";

class Handler {
    constructor(canvas) {
        this.canvas = canvas;

        this.arena = new Arena();

    }

    draw() {
        const context = this.canvas.getContext();
        context.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
        context.fillStyle = "black";
        context.fillRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
        this.arena.draw(context);
    }

    tick(keysPressed) {
        this.arena.tick(keysPressed);
    }
}