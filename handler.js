"use strict";

// class for handler which handles all game events, updates and drawing
class Handler {
    constructor(canvas) {
        this.canvas = canvas; // store canvas
        this.arena = new Arena(); // create a new arena
        
    }

    // method to draw everything in canvas
    draw() {
        const context = this.canvas.getContext(); // get the canvas drawing context
        context.imageSmoothingEnabled = false; // disable image smoothing so that individual pixels are not smoothed out to create pixel art effect
        context.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight()); // clear the canvas
        context.fillStyle = "black"; // change context fill style to black
        context.fillRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight()); // fill a black rectangle on canvas
        this.arena.draw(context); // draw the arena
    }

    // method to update everything in the game
    tick(buttonsPressed) {
        this.arena.tick(buttonsPressed); // update the arena
    }
}