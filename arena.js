"use strict";

class Arena {
    constructor() {
        this.enemies = [];
        this.obstructions = [];
        this.width = 15;
        this.height = 10;
        this.arenaType = 1;
        this.player = new Player(1, 1, this);
        this.generateArena();
    }

    generateArena() {
        if (arrayIncludes(Object.keys(ARENAS), this.arenaType)) {
            this.obstructions = ARENAS[this.arenaType];
        } else {
            this.obstructions = [];
        }
    }

    setArenaType(arenaType) {
        this.arenaType = arenaType;
        this.generateArena();
    }

    tick(keysPressed) {
        this.player.tick(keysPressed);
    }

    // method to convert coordinates to pixels on canvas
    coordsToPixels(coords) {
        const canvasWidth = canvas.getWidth(); // get width of canvas in pixels
        const canvasHeight = canvas.getHeight(); // get height of canvas in pixels

        const canvasPixelsRatio = canvasWidth / canvasHeight; // get the ratio between the width & height of the canvas
        const arenaRatio = this.width / this.height; // get the ratio between the width & height of the arena

        let pixelsPerTile; // declare variable of # of pixels per tile

        let pixelsXOffset = 0; // create variables to calculate pixels offset from center of screen
        let pixelsYOffset = 0;

        if (canvasPixelsRatio >= arenaRatio) { // check if the canvas ratio is larger than or equal to that of the arena
            pixelsPerTile = canvasHeight / this.height; // adjust the pixels size so that the arena fits on the canvas vertically
            pixelsXOffset = (canvasWidth - (pixelsPerTile * this.width)) / 2; // change x offset so that display is center of screen
        }
        else {
            pixelsPerTile = canvasWidth / this.width; // adjust the pixels size so that the arena fits on the canvas horizontally
            pixelsYOffset = (canvasHeight - (pixelsPerTile * this.height)) / 2;  // change y offset so that display is center of screen
        }

        return new Vector2(coords.getX() * pixelsPerTile + pixelsXOffset, canvasHeight - (coords.getY() * pixelsPerTile + pixelsYOffset)); // return the coordinates of the x & y pixels in a vector
    }

    // function to return # of pixels in 1 tile
    getUnitLength() {
        const canvasWidth = canvas.getWidth(); // get width of canvas in pixels
        const canvasHeight = canvas.getHeight(); // get height of canvas in pixels

        const canvasPixelsRatio = canvasWidth / canvasHeight; // get the ratio between the width & height of the canvas
        const arenaRatio = this.width / this.height; // get the ratio between the width & height of the arena

        if (canvasPixelsRatio >= arenaRatio) { // check if the canvas ratio is larger than or equal to that of the arena
            return canvasHeight / this.height; // adjust the tile size so that the arena fits on the canvas vertically & return it
        }
        else {
            return canvasWidth / this.width; // adjust the tile size so that the arena fits on the canvas horizontally & return it
        }
    }

    // function to draw arena
    draw(context) {
        const canvasWidth = canvas.getWidth(); // get width of canvas in pixels
        const canvasHeight = canvas.getHeight(); // get height of canvas in pixels

        const canvasPixelsRatio = canvasWidth / canvasHeight; // get the ratio between the width & height of the canvas
        const arenaRatio = this.width / this.height; // get the ratio between the width & height of the arena

        let pixelsPerTile; // declare variable of # of pixels per tile

        let pixelsXOffset = 0; // create variables to calculate pixels offset from center of screen
        let pixelsYOffset = 0;

        if (canvasPixelsRatio >= arenaRatio) { // check if the canvas ratio is larger than or equal to that of the arena
            pixelsPerTile = canvasHeight / this.height; // adjust the tile size so that the arena fits on the canvas vertically
            pixelsXOffset = (canvasWidth - (pixelsPerTile * this.width)) / 2; // change x offset so that display is center of screen
        }
        else {
            pixelsPerTile = canvasWidth / this.width; // adjust the tile size so that the arena fits on the canvas horizontally
            pixelsYOffset = (canvasHeight - (pixelsPerTile * this.height)) / 2;  // change y offset so that display is center of screen
        }
        // console.log(pixelsPerTile);
        // console.log(`${pixelsPerTile * this.width} x ${pixelsPerTile * this.height}`);
        // console.log(`${canvasWidth} x ${canvasHeight}`);
        for (let x = 0; x < this.width; x++) { // iterate through each x-coordinate tile
            for (let y = 0; y < this.height; y++) { // iterate each y-coordinate tile
                if (arrayIncludes(this.obstructions, new Vector2(x, y))) { // check if the x and y coordinates contain an obstruction
                    context.fillStyle = "rgb(50, 50, 50)"; // set a darker grey colour if there is an obstruction
                }
                else {
                    context.fillStyle = "rgb(128, 128, 128)"; // set a lighter grey colour if there is an obstruction
                }
                context.fillRect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // fill in a rectangle at the tile
            }
        }
        // start drawing grid pattern over tiles
        context.beginPath(); // start path of context
        context.lineWidth = "3"; // customize width of lines to 3 pixels
        context.strokeStyle = "white"; // customize lines to be white
        for (let x = 0; x < this.width; x++) { // iterate through all x coordinates
            for (let y = 0; y < this.height; y++) { // iterate through all y coordinates
                context.rect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // draw a white border around each tile
            }
        }
        context.stroke(); // draw all rectangles
        this.player.draw(context); // draw the player
    }
}