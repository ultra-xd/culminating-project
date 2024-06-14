"use strict";

// class for enemy spawner
class EnemySpawner {
    constructor(x, y, arena) {
        this.position = new Vector2(x, y); // store position of enemy spawner
        this.ticksPerPeriod = randomInteger(60, 90); // store number of ticks between each spawning cycle
        this.periodTicks = 0; // store number of ticks since last spawning cycle
        this.arena = arena; // store arena
        this.size = 1; // store display size of the spawner
        this.isSpawning = false; // store whether or not the spawner is spawning enemies currently
        this.enemiesSpawning = randomInteger(1, 5); // store the number of enemies that will be spawning on the next/current cycle
        this.enemiesSpawned = 0; // store the number of enemies that have spawned on the current cycle
        this.ticksBetweenSpawns = 30; // store the number of ticks between each spawn in a cycle
        this.spawningTicks = 0; // store the number of ticks since last spawn in a cycle
    }

    tick() {
        if (!this.isSpawning) { // check if the spawner is currently spawning enemies
            this.periodTicks++; // add to period ticks
            if (this.periodTicks > this.ticksPerPeriod) { // check if the period ticks has exceeded number of ticks in a period
                this.periodTicks = 0; // reset period ticks
                this.ticksPerPeriod = randomInteger(60, 90); // get new random period length between 60 & 90 ticks
                // 30% chance of spawning enemies
                let number = randomInteger(1, 10); // generate random number from 1-10
                if (number <= 3) { // check if the number is less than 3 (corresponds to 30$ chance)
                    this.isSpawning = true; // start spawning enemies
                }
            }
        }
        if (this.isSpawning) { // check if the spawner is currently spawning enemies
            this.spawningTicks++; // add to spawning ticks
            if (this.spawningTicks >= this.ticksBetweenSpawns) { // check if the spawning ticks has exceeded # of ticks between each spawn
                this.spawningTicks = 0; // reset spawning ticks
                this.enemiesSpawned++; // add to number of enemies spawned
                if (this.enemiesSpawned >= this.enemiesSpawning) { // check if the number of enemies has reached the number of enemies that should be spawning
                    this.isSpawning = false; // stop spawning enemies
                    this.enemiesSpawned = 0; // reset number of enemies spawned
                    this.enemiesSpawning = randomInteger(1, 5); // generate random number of enemies to be spawned next cycle
                }
            }
            // spawn an enemy 20 ticks into the animation
            if (this.spawningTicks == 20) { // check if the number of spawn ticks is 20
                this.arena.spawnEnemy(this.position.add(new Vector2(0.5, 0.5))); // spawn a new enemy centered around the tile the spawner is on
            }
        }
    }

    // method to draw the spawner
    draw(context) {
        // context.fillStyle = "purple";
        const pixelCoords = this.arena.coordsToPixels(this.position.add(new Vector2(0.5, 0.5))); // get the pixel coordinates of spawner centered around the tile it is on
        const unitLength = this.arena.getUnitLength(); // get number of pixels per tile

        const texture = IMAGE_LOADER[`files/assets/textures/animated/spawn-pod/${Math.floor(this.spawningTicks / 6) + 1}spawnpod.png`]; // get the appropriate sprite for the spawner based on animation ticks (there are 6 sprites, and the animation is 30 ticks long, meaning each frame will be 5 ticks long)

        context.drawImage(texture, pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size); // draw the spawner centered around the tile it is on
    }
}
