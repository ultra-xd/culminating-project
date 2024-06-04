"use strict";

let canvas; // declare global variable for canvas

// main function called on load of website
function main() {
    loadImages();
    canvas = new Canvas("canvas"); // create new canvas
    canvas.start(); // start the game loop for canvas
}