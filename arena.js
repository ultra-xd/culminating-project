"use strict";

// class for arena where obstacles, enemies & player is stored
class Arena {
    static GRASS_TEXTURE = IMAGE_LOADER["files/assets/textures/non-animated/grass.png"];
    static STONE_TEXTURE = IMAGE_LOADER["files/assets/textures/non-animated/stone.png"];
    static BACKGROUND_IMAGE = IMAGE_LOADER["files/assets/textures/non-animated/background.png"]
    constructor() {
        this.arenaType = randomChoice(Object.keys(ARENAS)); // determine the map layout using ID
        // this.arenaType = 2;
        this.obstructions = []; // create array of coordinates for walls on map
        this.enemies = [
            // new Enemy(4, 4, Enemy.SKELETON, this),
            // new Enemy(5, 5, Enemy.ZOMBIE, this),
            // new Enemy(8, 9, Enemy.ZOMBIE, this),
            // new Enemy(7, 9, Enemy.SKELETON, this),
            // new Enemy(1, 7, Enemy.ZOMBIE, this),
            // new Enemy(3, 14, Enemy.SKELETON, this)
        ]; // create array of enemies
        this.arrows = [];
        this.towers = [];
        this.enemySpawners = [];
        this.generateArena(); // generate map layout
        this.fireballs = [];
        this.width = 15; // set # of tiles horizontally on map
        this.height = 10; // set # of tiles vertically on map
        const playerPosition = ARENAS[this.arenaType]["playerStartPosition"];
        this.player = new Player(playerPosition.getX(), playerPosition.getY(), this); // create a new player
        this.currentMousePosition = undefined;
        this.deathDelayTicks = 0;
        this.deathDelayLimit = 120;
    }

    // method to generate arena layout
    generateArena() {
        this.towers = [];
        this.enemySpawners = [];
        // this.enemies = [];
        if (arrayIncludes(Object.keys(ARENAS), this.arenaType)) { // check if there is an arena with stored ID
            this.obstructions = ARENAS[this.arenaType]["walls"]; // get array of walls on the arena
            for (let tower of ARENAS[this.arenaType]["towers"]) {
                arrayPush(this.towers, new Tower(tower.getX(), tower.getY(), this));
            }
            for (let enemySpawner of ARENAS[this.arenaType]["enemySpawners"]) {
                arrayPush(this.enemySpawners, new EnemySpawner(enemySpawner.getX(), enemySpawner.getY(), this));
            }
            for (let enemy of ARENAS[this.arenaType]["spawnedEnemies"]) {
                this.spawnEnemy(enemy);
            }
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
        if (this.player.getIfAlive()) {
            this.player.tick(buttonsPressed); // update the player every tick
        } else {
            this.deathDelayTicks++;
            if (this.deathDelayTicks > this.deathDelayLimit) {
                console.log("E")
                endGame();
            }
        }
        for (let enemySpawner of this.enemySpawners) {
            enemySpawner.tick();
        }
        for (let enemy of this.enemies) { // iterate through all enemies in the arena
            enemy.tick(); // tick all enemies
        }
        for (let arrow of this.arrows) {
            arrow.tick();
        }
        for (let tower of this.towers) {
            tower.tick();
        }
        for (let fireball of this.fireballs) {
            fireball.tick();
        }
        for (let i = 0; i < this.enemies.length; i++) {
            let enemy = this.enemies[i];
            if (enemy.getHealth() <= 0) {
                arrayDelete(this.enemies, i);
            }
        }

        for (let i = 0; i < this.arrows.length; i++) {
            let arrow = this.arrows[i];
            if (arrow.getIfCollidedWithPlayer() || arrow.getDespawnTimer() > arrow.getDespawnLimit()) {
                arrayDelete(this.arrows, i);
            }
        }
        for (let i = 0; i < this.fireballs.length; i++) {
            let fireball = this.fireballs[i];
            if (fireball.getIfExploded()) {
                arrayDelete(this.fireballs, i);
            }
        }
        // console.log(this.projectiles);
        let mousePosition = game.getCanvas().getMousePosition();
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
        const canvasWidth = game.getCanvas().getWidth(); // get width of canvas in pixels
        const canvasHeight = game.getCanvas().getHeight(); // get height of canvas in pixels

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
        const canvasWidth = game.getCanvas().getWidth(); // get width of canvas in pixels
        const canvasHeight = game.getCanvas().getHeight(); // get height of canvas in pixels

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
        return (arrayIncludes(this.obstructions, coordinates) || this.isTower(coordinates) || // check if the tile is a wall or tower
                coordinates.getX() < 0 || coordinates.getX() >= this.width || // check if the tile is out of bounds (less than 0 or more than width/height)
                coordinates.getY() < 0 || coordinates.getY() >= this.height
                );
    }

    isTower(coordinates) {
        for (let tower of this.towers) {
            if (coordinates.equals(tower.getPosition())) {
                return true;
            }
        }
        return false;
    }

    getTowers() {
        let towers = [];
        for (let tower of this.towers) {
            arrayPush(towers, tower.getPosition());
        }
        return towers;
    }

    launchArrow(coordinates, velocity) {
        arrayPush(this.arrows, new Arrow(coordinates, velocity, this));
    }

    launchFireball(fireball) {
        arrayPush(this.fireballs, fireball);
    }

    spawnEnemy(position) {
        let type = (randomInteger(0, 2) == 0) ? Enemy.SKELETON: Enemy.ZOMBIE;
        arrayPush(this.enemies, new Enemy(position.getX(), position.getY(), type, this));
    }

    // method to return # of pixels in 1 tile
    getUnitLength() {
        const canvasWidth = game.getCanvas().getWidth(); // get width of canvas in pixels
        const canvasHeight = game.getCanvas().getHeight(); // get height of canvas in pixels

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
        const canvasWidth = game.getCanvas().getWidth(); // get width of canvas in pixels
        const canvasHeight = game.getCanvas().getHeight(); // get height of canvas in pixels

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

        const backgroundAspectRatio = 1920 / 1548;
        let backgroundWidth, backgroundHeight;
        if (canvasPixelsRatio >= canvasPixelsRatio) {
            backgroundWidth = canvasWidth;
            backgroundHeight = backgroundWidth / backgroundAspectRatio;
        } else {
            backgroundHeight = canvasHeight;
            backgroundWidth = backgroundHeight * backgroundAspectRatio;
        }

        context.drawImage(Arena.BACKGROUND_IMAGE, canvasWidth / 2 - backgroundWidth / 2, canvasHeight / 2 - backgroundHeight / 2, backgroundWidth, backgroundHeight);
        
        // console.log(pixelsPerTile);
        // console.log(`${pixelsPerTile * this.width} x ${pixelsPerTile * this.height}`);
        // console.log(`${canvasWidth} x ${canvasHeight}`);

        for (let x = 0; x < this.width; x++) { // iterate through each x-coordinate tile
            for (let y = 0; y < this.height; y++) { // iterate each y-coordinate tile
                if (arrayIncludes(this.obstructions, new Vector2(x, y))) { // check if the x and y coordinates contain an obstruction
                    // context.fillStyle = "rgb(50, 50, 50)"; // set a darker grey colour if there is an obstruction
                    context.drawImage(Arena.STONE_TEXTURE, x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile);
                }
                else {
                    context.drawImage(Arena.GRASS_TEXTURE, x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile);
                }
                // context.fillRect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // fill in a rectangle at the tile
            }
        }
        // start drawing grid pattern over tiles
        context.beginPath(); // start path of context
        context.lineWidth = "3"; // customize width of lines to 3 pixels
        context.strokeStyle = "black"; // customize lines to be white
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
            context.strokeStyle = "white";
            context.lineWidth = "3";
            context.rect(highlightedSquare.getX() * pixelsPerTile + pixelsXOffset, canvasHeight - ((highlightedSquare.getY() + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile);
            
            context.stroke();
        }
        for (let enemySpawner of this.enemySpawners) {
            enemySpawner.draw(context);
        }
        if (this.player.getIfAlive()) {  
            this.player.draw(context); // draw the player
        }
        for (let enemy of this.enemies) { // iterate through all enemies
            enemy.draw(context); // draw all enemies
        }
        for (let arrow of this.arrows) {
            arrow.draw(context);
        }
        for (let tower of this.towers) {
            tower.draw(context);
        }
        for (let fireball of this.fireballs) {
            fireball.draw(context);
        }

        // context.fillStyle = "black";
        // context.font = "60px Consolas";
        // for (let x = 0; x < this.width; x++) { // iterate through all x coordinates
        //     for (let y = 0; y < this.height; y++) { // iterate through all y coordinates
        //         // context.rect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // draw a white border around each tile
        //         let heatmapValue = this.player.getPathfindingAlgorithm().heatmap[`(${x}, ${y})`];
        //         let pixels = this.coordsToPixels(new Vector2(x, y));
        //         context.fillText(Math.round(heatmapValue), pixels.getX(), pixels.getY(), pixelsPerTile);
        //     }
        // }
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

console.log(IMAGE_LOADER["files/assets/textures/non-animated/grass.png"])
