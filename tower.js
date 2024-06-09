"use strict";

// class for tower
class Tower {
    constructor(x, y, arena) {
        this.position = new Vector2(x, y);
        this.arena = arena;
        this.ticksSinceShot = 0;
        this.ticksPerPeriod = 120;
        this.width = 1;
        this.height = 2;
    }

    tick() {
        this.ticksSinceShot++;
        if (this.ticksSinceShot > this.ticksPerPeriod) {
            this.ticksSinceShot = 0;
            let number = randomInteger(1, 5);
            if (number <= 2) {
                this.shootFireball();
                // this.shootFireball();
            }
        }
    }

    shootFireball() {
        let fireball = new Fireball(this.position.getX() + 0.5, this.position.getY() + 0.5, this.arena.getPlayer().getPosition().getX(), this.arena.getPlayer().getPosition().getY(), this.arena);
        // let fireball = new Fireball(this.position.getX(), this.position.getY(), this.arena.getEnemies()[0].getPosition().getX(), this.arena.getEnemies()[0].getPosition().getY(), this.arena);
        this.arena.launchFireball(fireball);
    }

    draw(context) {
        context.fillStyle = "orange";
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the position of the player on the screen
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player
        context.fillRect(pixelCoords.getX(), pixelCoords.getY() - this.height * unitLength, this.width * unitLength, this.height * unitLength);
        // console.log("drawing")
    }
    getPosition() {
        return this.position;
    }
}

class Fireball {
    constructor(x, y, finalX, finalY, arena) {
        this.position = new Vector2(x, y);
        this.initialPosition = this.position;
        this.finalPosition = new Vector2(finalX, finalY);
        this.speed = 3;
        this.velocity = this.finalPosition.subtract(this.initialPosition).unit().multiply(this.speed);
        this.lifeSpan = Math.ceil(this.finalPosition.subtract(this.initialPosition).getMagnitude() / this.speed * TPS);
        this.ticks = 0;
        this.radius = 1;
        this.hasExploded = false;
        this.arena = arena;
        this.power = 5;
        this.damage = 20;
    }

    tick() {
        this.position = this.position.add(this.velocity.divide(TPS));
        this.ticks++;
        if (this.ticks >= this.lifeSpan) {
            this.explode();
        }
    }

    explode() {
        this.hasExploded = true;
        for (let enemy of this.arena.getEnemies()) {
            let directionVector = enemy.getPosition().subtract(this.position);
            let distance = directionVector.getMagnitude();
            if (distance <= this.radius) {
                this.attack(enemy, this.damage);
            }
        }
        let directionVector = this.arena.getPlayer().getPosition().subtract(this.position);
        let distance = directionVector.getMagnitude();
        if (distance <= this.radius) {
            this.attack(this.arena.getPlayer(), this.damage);
        }
    }

    attack(entity, damage) {
        let forcedVelocity;
        let directionVector = entity.getPosition().subtract(this.position);
        let distance = directionVector.getMagnitude();
        if (distance != 0) {
            forcedVelocity = directionVector.unit().multiply(this.power - (this.power * distance / this.radius));
        } else {
            forcedVelocity = Vector2.J_UNIT.multiply(this.power);
        }
        entity.setForcedVelocity(forcedVelocity);
        entity.decreaseHealth(damage);
    }

    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the position of the player on the screen
        // console.log(pixelCoords);
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player

        context.fillStyle = "blue";

        context.beginPath();
        context.arc(pixelCoords.getX(), pixelCoords.getY(), this.radius * unitLength, 0, 2 * Math.PI);
        context.fill();
    }
    getIfExploded() {
        return this.hasExploded;
    }
}
