"use strict";

class EnemySpawner {
    constructor(x, y, arena) {
        this.position = new Vector2(x, y);
        this.ticksPerPeriod = randomInteger(600, 900);
        this.periodTicks = 0;
        this.arena = arena;
        this.size = 0.5;
        this.isSpawning = false;
        this.enemiesSpawning = randomInteger(1, 5);
        this.enemiesSpawned = 0;
        this.ticksBetweenSpawns = 30;
        this.spawningTicks = 0;
    }

    tick() {
        if (!this.isSpawning) {
            this.periodTicks++;
            if (this.periodTicks > this.ticksPerPeriod) {
                this.periodTicks = 0;
                this.ticksPerPeriod = randomInteger(600, 900);
                let number = randomInteger(1, 10);
                if (number <= 3) {
                    this.isSpawning = true;
                }
            }
        }
        if (this.isSpawning) {
            this.spawningTicks++;
            if (this.spawningTicks >= this.ticksBetweenSpawns) {
                this.spawningTicks = 0;
                this.enemiesSpawned++;
                if (this.enemiesSpawned >= this.enemiesSpawning) {
                    this.isSpawning = false;
                    this.enemiesSpawned = 0;
                    this.enemiesSpawning = randomInteger(1, 5);
                }
                this.arena.spawnEnemy(this.position.add(new Vector2(0.5, 0.5)));
            }
        }
    }

    draw(context) {
        context.fillStyle = "purple";
        const pixelCoords = this.arena.coordsToPixels(this.position.add(new Vector2(0.5, 0.5)));
        const unitLength = this.arena.getUnitLength();
        context.fillRect(pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size);
    }
}
