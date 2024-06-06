"use strict";

// class for arena where obstacles, enemies & player is stored
class Arena {
    constructor() {
        this.arenaType = 1; // determine the map layout using ID
        this.obstructions = []; // create array of coordinates for walls on map
        this.generateArena(); // generate map layout
        this.enemies = [
            new Enemy(4, 4, Enemy.SKELETON, this),
            new Enemy(5, 5, Enemy.ZOMBIE, this),
            new Enemy(8, 9, Enemy.ZOMBIE, this),
            new Enemy(7, 9, Enemy.SKELETON, this),
            new Enemy(1, 7, Enemy.ZOMBIE, this),
            new Enemy(3, 14, Enemy.SKELETON, this)
        ]; // create array of enemies
        this.width = 15; // set # of tiles horizontally on map
        this.height = 10; // set # of tiles vertically on map
        this.player = new Player(1, 1, this); // create a new player
        this.currentMousePosition = undefined;
    }

    // method to generate arena layout
    generateArena() {
        if (arrayIncludes(Object.keys(ARENAS), this.arenaType)) { // check if there is an arena with stored ID
            this.obstructions = ARENAS[this.arenaType]; // get array of walls on the arena
        } else {
            this.obstructions = []; // generate no walls if ID is not valid
        }
    }

    // method to set the type of arena & update arena layout
    setArenaType(arenaType) {
        this.arenaType = arenaType; // update arena ID
        this.generateArena(); // update arena layout
    }

    // method to update the arena every tick
    tick(buttonsPressed) {
        this.player.tick(buttonsPressed); // update the player every tick
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            if (enemy.getHealth() <= 0) {
                arrayDelete(this.enemies, i);
            }
        }
        for (let enemy of this.enemies) { // iterate through all enemies in the arena
            enemy.tick(); // tick all enemies
        }
        let mousePosition = canvas.getMousePosition();
        if (mousePosition != undefined) {
            let coordsMousePosition = this.pixelsToCoords(mousePosition);
            if (coordsMousePosition.getX() >= 0 && coordsMousePosition.getX() < this.width &&
                coordsMousePosition.getY() >= 0 && coordsMousePosition.getY() < this.height) {
                this.currentMousePosition = coordsMousePosition;
            }
        }
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

    // method to convert pixels on canvas to coordinates
    pixelsToCoords(pixelPosition) {
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

        return new Vector2((pixelPosition.getX() - pixelsXOffset) / pixelsPerTile, (canvasHeight - pixelPosition.getY() - pixelsYOffset) / pixelsPerTile);
    }

    // method to return if given coordinates is a wall
    isWall(coordinates) {
        return (arrayIncludes(this.obstructions, coordinates) || // check if the tile is a wall
                coordinates.getX() < 0 || coordinates.getX() >= this.width || // check if the tile is out of bounds (less than 0 or more than width/height)
                coordinates.getY() < 0 || coordinates.getY() >= this.height
                )
    }

    // method to return # of pixels in 1 tile
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

    // function to draw arena on canvas
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
        context.fillStyle = "black";
        context.font = "60px Consolas";
        for (let x = 0; x < this.width; x++) { // iterate through all x coordinates
            for (let y = 0; y < this.height; y++) { // iterate through all y coordinates
                context.rect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // draw a white border around each tile
                // let heatmapValue = this.player.getPathfindingAlgorithm().heatmap[`(${x}, ${y})`];
                // let pixels = this.coordsToPixels(new Vector2(x, y));
                // context.fillText(Math.round(heatmapValue), pixels.getX(), pixels.getY(), pixelsPerTile);
            }
        }

        context.stroke(); // draw all rectangles

        if (this.currentMousePosition != undefined) {
            context.beginPath();

            let highlightedSquare = this.currentMousePosition.floor();
            context.strokeStyle = "black";
            context.lineWidth = "3px";
            context.rect(highlightedSquare.getX() * pixelsPerTile + pixelsXOffset, canvasHeight - ((highlightedSquare.getY() + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile);
            
            context.stroke();
        }

        this.player.draw(context); // draw the player

        for (let enemy of this.enemies) { // iterate through all enemies
            enemy.draw(context); // draw all enemies
        }
        
    }

    inflictDamage(point, radius) {

    }

    // method to get the player in the arena
    getPlayer() {
        return this.player; // return the player
    }

    getEnemies() {
        return this.enemies;
    }

    getCoordinateMousePosition() {
        return this.currentMousePosition;
    }
}