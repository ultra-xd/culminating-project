"use strict";

class Arena {
    constructor() {
        this.enemies = [];
        this.obstructions = [];
        this.width = 32;
        this.height = 18;
        this.arenaType = 1;
        this.generateArena();
    }

    generateArena() {
        this.obstructions = ARENAS[this.arenaType];
    }

    tick() {

    }

    draw(context) {
        const canvasWidth = canvas.getWidth(); // get width of canvas in pixels
        const canvasHeight = canvas.getHeight(); // get height of canvas in pixels

        const canvasPixelsRatio = canvasWidth / canvasHeight; // get the ratio between the width & height of the canvas
        const arenaRatio = this.width / this.height; // get the ratio between the width & height of the arena

        let pixelsPerTile; // declare variable of # of pixels per tile

        if (canvasPixelsRatio >= arenaRatio) { // check if the canvas ratio is larger than or equal to that of the arena
            pixelsPerTile = canvasHeight / this.height; // adjust the pixels size so that the arena fits on the canvas vertically
        }
        else {
            pixelsPerTile = canvasWidth / this.width; // adjust the pixels size so that the arena fits on the canvas horizontally
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                if (arrayIncludes(this.obstructions, new Vector2(x, y))) {
                    context.fillStyle = "rgb(50, 50, 50)";
                }
                else {
                    context.fillStyle = "rgb(128, 128, 128)";
                }
                context.fillRect(x * pixelsPerTile, y * pixelsPerTile, pixelsPerTile, pixelsPerTile);
            }
        }
    }
}