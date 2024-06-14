"use strict";

// class for a new game
class Game {
    constructor() {
        this.canvas = new Canvas("canvas"); // create the new canvas
    }

    // method to start the game loop of the canvas
    start() {
        this.canvas.start(); // call method to start canvas
    }

    // method to end game loop of the canvas
    end() {
        this.canvas.end(); // call method to end canvas game loop
    }

    // method to get the canvas
    getCanvas() {
        return this.canvas; // return the canvas
    }
}