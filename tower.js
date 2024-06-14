"use strict";

// class for tower
class Tower {
    // create texture for tower
    static TEXTURE = IMAGE_LOADER["files/assets/textures/non-animated/tower.png"];
    constructor(x, y, arena) {
        this.position = new Vector2(x, y); // set position of tower
        this.arena = arena; // store arena
        this.ticksSinceShot = 0; // store number of ticks since fireball has been shot
        this.ticksPerPeriod = randomInteger(180, 300); // store number of ticks per fireball shooting
        this.width = 1; // store width of tower in tiles
        this.height = 2; // store height of tower in tiles
    }

    // method to update tower
    tick() {
        this.ticksSinceShot++; // increase ticks since shot
        if (this.ticksSinceShot > this.ticksPerPeriod) { // check if the number of ticks completes a period
            this.ticksSinceShot = 0; // reset ticks since shot
            this.ticksPerPeriod = randomInteger(180, 300); // randomize # of ticks per period
            // 40% chance of firing a fireball
            let number = randomInteger(1, 5); // generate random number from 1 to 5
            if (number <= 2) { // check if number is less than 2 (corresponds to 40% chance)
                this.shootFireball(); // shoot a fireball
                // this.shootFireball();
            }
        }
    }

    // method to shoot a fireball to player
    shootFireball() {
        let fireball = new Fireball(this.position.getX() + 0.5, this.position.getY() + 0.5, this.arena.getPlayer().getPosition().getX(), this.arena.getPlayer().getPosition().getY(), this.arena); // create a new fireball to the player position
        // let fireball = new Fireball(this.position.getX(), this.position.getY(), this.arena.getEnemies()[0].getPosition().getX(), this.arena.getEnemies()[0].getPosition().getY(), this.arena);
        this.arena.launchFireball(fireball); // add fireball to arena
    }

    // method to draw tower
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the position of the tower on the screen
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the tower
        // draw the tower on the arena
        context.drawImage(Tower.TEXTURE, pixelCoords.getX(), pixelCoords.getY() - this.height * unitLength, this.width * unitLength, this.height * unitLength);
    }

    // method to get position of tower
    getPosition() {
        return this.position; // return position of tower
    }
}

// class for fireball
class Fireball {
    // preload image for fireball
    static TEXTURE = IMAGE_LOADER["files/assets/textures/non-animated/fireball.png"]
    constructor(x, y, finalX, finalY, arena) {
        this.position = new Vector2(x, y); // set position of fireball
        this.initialPosition = this.position; // set initial position of fireball to the position when first intialized
        this.finalPosition = new Vector2(finalX, finalY); // set final position of fireball
        this.speed = 3; // set speed of fireball
        this.velocity = this.finalPosition.subtract(this.initialPosition).unit().multiply(this.speed); // set velocity of fireball in direction of player
        this.lifeSpan = Math.ceil(this.finalPosition.subtract(this.initialPosition).getMagnitude() / this.speed * TPS); // set lifespan of fireball by calculating how long it would take for the fireball to reach its destination
        this.ticks = 0; // set number of ticks the fireball existed for to 0
        this.radius = 1; // set size of fireball (radius) to 1 tile
        this.hasExploded = false; // store whether if the fireball should have exploded yet
        this.arena = arena; // store arena fireball is in
        this.power = 5; // store power of 5 (amount of knockback dealt)
        this.damage = 20; // store damage done to entities to 20
        this.TEXTURE_DEFAULT_DIRECTION = Math.PI * 5 / 4; // store default direction of the texture to rotate the fireball properly when drawn
    }
    
    // method to update fireball
    tick() {
        this.position = this.position.add(this.velocity.divide(TPS)); // update position of fireball based on velocity
        this.ticks++; // increase number of ticks
        if (this.ticks >= this.lifeSpan) { // check if the number of ticks exceeds lifespan
            this.explode(); // explode fireball
        }
    }

    // method to explode fireball
    explode() {
        this.hasExploded = true; // set explosion status to positive
        for (let enemy of this.arena.getEnemies()) { // iterate through all enemies
            let directionVector = enemy.getPosition().subtract(this.position); // calculate direction vector from center of fireball to enemy
            let distance = directionVector.getMagnitude(); // get distance from center of fireball to enemy
            if (distance <= this.radius) { // check if enemy is within radius of fireball
                this.attack(enemy, this.damage); // attack enemy
            }
        }
        let directionVector = this.arena.getPlayer().getPosition().subtract(this.position); // calculate direction vector from center of fireball to player
        let distance = directionVector.getMagnitude(); // get distance from center of fireball to player
        if (distance <= this.radius) { // check if player is within radius of fireball
            this.attack(this.arena.getPlayer(), this.damage); // attack player
        }
    }

    // method to attack an entity
    attack(entity, damage) {
        let forcedVelocity; // declare forced velocity variable
        let directionVector = entity.getPosition().subtract(this.position); // get direction vector from center of fireball to entity
        let distance = directionVector.getMagnitude(); // get distance from center of fireball to entity
        if (distance != 0) { // check if the distance is not 0
            forcedVelocity = directionVector.unit().multiply(this.power - (this.power * distance / this.radius)); // calculate forced velocity based on direction to entity & how close the entity is (closer = more knockback)
        } else { // otherwise, fireball is in same position as entity
            forcedVelocity = Vector2.J_UNIT.multiply(this.power); // knock player upwards (this situation should be vey rare but dealt with anyway)
        }
        entity.setForcedVelocity(forcedVelocity); // set forced velocity of entity
        entity.decreaseHealth(damage); // deal damage to to entity
    }

    // method to draw fireball
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the position of the player on the screen
        const finalPositionPixelCoords = this.arena.coordsToPixels(this.finalPosition); // get the final position of the fireball on the screen

        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player

        let angle = this.velocity.getAngle(); // get the angle of the fireball based on velocity

        // rotate the fireball so that it faces the direction of the velocity
        context.translate(pixelCoords.getX(), pixelCoords.getY()); // adjust center of rotation to center of fireball
        context.rotate((angle - this.TEXTURE_DEFAULT_DIRECTION) * -1); // rotate fireball
        context.translate(-1 * pixelCoords.getX(), -1 * pixelCoords.getY()); // undo center of rotation of fireball

        // draw the fireball
        context.drawImage(Fireball.TEXTURE, pixelCoords.getX() - (unitLength * this.radius), pixelCoords.getY() - (unitLength * this.radius), unitLength * this.radius * 2, unitLength * this.radius * 2);
        context.setTransform(1, 0, 0, 1, 0, 0); // reset rotation by changing transformation to default matrix

        // draw target of fireball
        context.fillStyle = "rgba(255, 0, 0, 0.5)"; // set colour to transparent red
        
        // draw a circle at the target of fireball
        context.beginPath();
        context.arc(finalPositionPixelCoords.getX(), finalPositionPixelCoords.getY(), this.radius * unitLength, 0, 2 * Math.PI);
        context.fill();
    }

    // method to get if fireball exploded
    getIfExploded() {
        return this.hasExploded; // return if fireballed exploded
    }
}
