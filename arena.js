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
        this.enemies = []; // create array of enemies
        this.arrows = []; // create array of arrows
        this.towers = []; // create array of towers
        this.enemySpawners = []; // create array of enemy spawners
        this.generateArena(); // generate map layout
        this.fireballs = []; // create array of fireballs
        this.width = 15; // set # of tiles horizontally on map
        this.height = 10; // set # of tiles vertically on map
        this.currentMousePosition = undefined; // store current mouse position
        this.deathDelayTicks = 0; // store number of ticks since player death (player hasnt died yet)
        this.deathDelayLimit = 120; // store number of ticks until game ends after player's death
        const playerPosition = ARENAS[this.arenaType]["playerStartPosition"]; // get player position
        this.player = new Player(playerPosition.getX(), playerPosition.getY(), this); // create player at player position
    }

    // method to generate arena layout
    generateArena() {
        this.towers = []; // clear list of towers
        this.enemySpawners = []; // clear list of enemy spawners
        if (arrayIncludes(Object.keys(ARENAS), this.arenaType)) { // check if there is an arena with stored ID
            this.obstructions = ARENAS[this.arenaType]["walls"]; // get array of walls on the arena
            for (let tower of ARENAS[this.arenaType]["towers"]) { // iterate through all towers supposed to be generated
                arrayPush(this.towers, new Tower(tower.getX(), tower.getY(), this)); // generate all of the towers by adding to array of towers
            }
            for (let enemySpawner of ARENAS[this.arenaType]["enemySpawners"]) { // iterate through all enemy spawners supposed to be generated
                arrayPush(this.enemySpawners, new EnemySpawner(enemySpawner.getX(), enemySpawner.getY(), this)); // generate all enemy spawners by adding to array of enemy spawners
            }
            for (let enemy of ARENAS[this.arenaType]["spawnedEnemies"]) { // iterate through all enemies supposed to be spawned
                this.spawnEnemy(enemy); // spawn all of the enemies
            }
        } else { // arena type is unknown and a random arena is generated
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
        if (this.player.getIfAlive()) { // check if the player is alive
            this.player.tick(buttonsPressed); // update the player every tick
        } else { // otherwise, player is dead
            this.deathDelayTicks++; // add ticks to death screen so that the user has time to process the player died
            if (this.deathDelayTicks > this.deathDelayLimit) { // check if enough ticks have passed since death
                endGame(); // end the game
            }
        }
        // tick all elements of the game
        for (let enemySpawner of this.enemySpawners) { // iterate through all enemy spawners
            enemySpawner.tick(); // tick enemy spawners
        }
        for (let enemy of this.enemies) { // iterate through all enemies in the arena
            enemy.tick(); // tick all enemies
        }
        for (let arrow of this.arrows) { // iterate through all arrows
            arrow.tick(); // tick all arrows
        }
        for (let tower of this.towers) { // iterate through all towers
            tower.tick(); // tick all towers
        }
        for (let fireball of this.fireballs) { // iterate through all fireballs
            fireball.tick(); // tick all fireballs
        }
        // create enemy death mechanism
        for (let i = 0; i < this.enemies.length; i++) { // iterate through all enemies
            let enemy = this.enemies[i]; // get the enemy
            if (enemy.getHealth() <= 0) { // check if the enemy health is less than 0 i.e dead
                arrayDelete(this.enemies, i); // delete enemy from array of enemies
            }
        }

        // create arrow despawning mechanism
        for (let i = 0; i < this.arrows.length; i++) { // iterate through all arrows
            let arrow = this.arrows[i]; // get the arrow
            if (arrow.getIfCollidedWithPlayer() || arrow.getDespawnTimer() > arrow.getDespawnLimit()) { // check if the arrow has already collided with the player or if it has passed its despawn timer
                arrayDelete(this.arrows, i); // delete arrow from array of arrows
            }
        }
        // create fireball exploding & despawning mechanism
        for (let i = 0; i < this.fireballs.length; i++) { // iterate through all fireballs
            let fireball = this.fireballs[i]; // get the fireball
            if (fireball.getIfExploded()) { // check if the fireball has exploded
                arrayDelete(this.fireballs, i); // delete fireball from array of fireballs
            }
        }

        //  get mouse position on canvas in tile units
        let mousePosition = game.getCanvas().getMousePosition(); // get the mouse position in pixels
        if (mousePosition != undefined) { // check if the mouse position exists and has been updated
            let coordsMousePosition = this.pixelsToCoords(mousePosition); // get the mouse position in tile units
            if (coordsMousePosition.getX() >= 0 && coordsMousePosition.getX() < this.width && // check if mouse position is out of bounds
                coordsMousePosition.getY() >= 0 && coordsMousePosition.getY() < this.height) {
                this.currentMousePosition = coordsMousePosition; // update the mouse position
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

    // method to return if given coordinates is a tower
    isTower(coordinates) {
        for (let tower of this.towers) { // iterate through all towers
            if (coordinates.equals(tower.getPosition())) { // check if tower coordinate is equal to coordinates given
                return true; // return positive result
            }
        }
        return false; // return negative result
    }

    // method to get all positions of towers
    getTowerPositions() {
        let towers = []; // create new array of tower positions
        for (let tower of this.towers) { // iterate through all towers
            arrayPush(towers, tower.getPosition()); // add the tower position to array of tower positions
        }
        return towers; // return array of tower positions
    }

    // method to launch an arrow at coordinates at a specific velocity`
    launchArrow(coordinates, velocity) {
        arrayPush(this.arrows, new Arrow(coordinates, velocity, this)); // add a new arrow to array of arrows at the coordinates & velocity given
    }

    // method to laucnh a fireball
    launchFireball(fireball) {
        arrayPush(this.fireballs, fireball); // add fireball to array of fireballs
    }

    // method to spawn a random enemy at a given position
    spawnEnemy(position) {
        let type = (randomInteger(0, 2) == 0) ? Enemy.SKELETON: Enemy.ZOMBIE; // randomize whether the enemy will be a zombie or skeleton (~67% skeleton, ~33% zombie)
        arrayPush(this.enemies, new Enemy(position.getX(), position.getY(), type, this)); // add a new enemy at the specified position and random type
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

        // draw background
        // background image must fit on canvas, so this code is to determine the optimal width & height of the image
        const backgroundAspectRatio = 1920 / 1548; // constant to store background image aspect ratio
        let backgroundWidth, backgroundHeight; // declare background width & height variables in pixels
        if (canvasPixelsRatio >= backgroundAspectRatio) { // check if the relative width of the canvas is larger than or equal to the relative width of the canvas 
            backgroundWidth = canvasWidth; // set background width to canvas width
            backgroundHeight = backgroundWidth / backgroundAspectRatio; // set background height to be proportional to that of the background width
        } else {
            backgroundHeight = canvasHeight; // set background height to canvas height
            backgroundWidth = backgroundHeight * backgroundAspectRatio; // set background width to be proportional to that of the background height
        }

        // draw the background image so that it fits on the canvas in the center
        context.drawImage(Arena.BACKGROUND_IMAGE, canvasWidth / 2 - backgroundWidth / 2, canvasHeight / 2 - backgroundHeight / 2, backgroundWidth, backgroundHeight);

        // draw tiles
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
        context.strokeStyle = "black"; // customize lines to be black
        for (let x = 0; x < this.width; x++) { // iterate through all x coordinates
            for (let y = 0; y < this.height; y++) { // iterate through all y coordinates
                context.rect(x * pixelsPerTile + pixelsXOffset, canvasHeight - ((y + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // draw a black border around each tile
                // let heatmapValue = this.player.getPathfindingAlgorithm().heatmap[`(${x}, ${y})`];
                // let pixels = this.coordsToPixels(new Vector2(x, y));
                // context.fillText(Math.round(heatmapValue), pixels.getX(), pixels.getY(), pixelsPerTile);
            }
        }

        context.stroke(); // draw all rectangles

        // code to draw highlighted tile on arena
        if (this.currentMousePosition != undefined) { // check if the mouse position exists
            context.beginPath(); // start path of context

            let highlightedSquare = this.currentMousePosition.floor(); // get the square that the mouse is on
            context.strokeStyle = "white"; // customize lines to be black
            context.lineWidth = "3"; // customize width of lines to 3 pixels
            context.rect(highlightedSquare.getX() * pixelsPerTile + pixelsXOffset, canvasHeight - ((highlightedSquare.getY() + 1) * pixelsPerTile + pixelsYOffset), pixelsPerTile, pixelsPerTile); // draw a white border around the highlighted tile
            
            context.stroke(); // draw the rectangle
        }

        // draw everything else
        for (let enemySpawner of this.enemySpawners) { // iterate through all enemy spawners
            enemySpawner.draw(context); // draw enemy spawners
        }
        if (this.player.getIfAlive()) { // check if player is alive
            this.player.draw(context); // draw the player
        }
        for (let enemy of this.enemies) { // iterate through all enemies
            enemy.draw(context); // draw all enemies
        }
        for (let arrow of this.arrows) { // iteraet through all arrows
            arrow.draw(context); // draw all arrows
        }
        for (let tower of this.towers) { // iterate through all towers
            tower.draw(context); // draw all towers
        }
        for (let fireball of this.fireballs) { // iterate through all fireballs
            fireball.draw(context); // draw all fireballs
        }
    }

    // method to get the player in the arena
    getPlayer() {
        return this.player; // return the player
    }

    // method to get all enemies in arena
    getEnemies() {
        return this.enemies; // return array of enemies
    }
    
    // method to get mouse position in tile units
    getCoordinateMousePosition() {
        return this.currentMousePosition; // return mouse position in tile units
    }
}
