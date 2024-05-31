"use strict";

// class for player where the movement & collisions of player are tracked
class Player {
    constructor(x, y, arena) {
        this.arena = arena; // store the arena the player is in
        this.position = new Vector2(x, y); // create a position vector for the player
        this.width = 1; // store the width of the player in tile units
        this.height = 1; // store the height of the player in tile units
        this.controlledVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player can control to 0
        this.forcedVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player cannot control to 0
        this.direction = "D"; // set the player direction to be facing downwards
    }

    // method to update the player every tick
    tick(keysPressed) {
        this.controlledVelocity = Vector2.ZERO_VECTOR; // reset the controlled player velocity to 0
        for (let key of keysPressed) { // iterate through all keys that are pressed
            if (key == "w") { // check if W key is being pressed
                this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT); // increase velocity in positive Y direction
            }
            if (key == "d") { // check if D key is being pressed
                this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT); // increase velocity in positive X direction
            }
            if (key == "a") { // check if A key is being pressed
                this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT.multiply(-1)); // increase velocity in negative X direction
            }
            if (key == "s") { // check if S key is being pressed
                this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT.multiply(-1)); // increase velocity in negative Y direction
            }
        }
        this.controlledVelocity = (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) ? this.controlledVelocity.unit().multiply(Math.PI): Vector2.ZERO_VECTOR; // set controllable velocity to have magnitude of 1 if it is not 0
        let totalVelocity = this.controlledVelocity.add(this.forcedVelocity);
        this.position = this.position.add(this.controlledVelocity.add(this.forcedVelocity).divide(TPS)); // change position based on velocity

        // check for collisions
        this.hitbox = new Rectangle(this.position.getX() - this.width / 2, this.position.getY() - this.height / 2, this.width, this.height);
        let closestWalls = this.getClosestWalls();
        for (let wall of closestWalls) {
            let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1);
            if (this.hitbox.intersectsWith(wallHitbox)) {
                let collisionType;
                let difference = undefined;
                if (totalVelocity.getX() > 0) {
                    if (totalVelocity.getY() > 0) {
                        difference = new Vector2(this.hitbox.x2, this.hitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1));
                    } else if (totalVelocity.getY() < 0) {
                        difference = new Vector2(this.hitbox.x2, this.hitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2));
                    } else {
                        collisionType = VERTICAL;
                    }
                } else if (totalVelocity.getX() < 0) {
                    if (totalVelocity.getY() > 0) {
                        difference = new Vector2(this.hitbox.x1, this.hitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1));
                    } else if (totalVelocity.getY() < 0) {
                        difference = new Vector2(this.hitbox.x1, this.hitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2));
                    } else {
                        collisionType = VERTICAL;
                    }
                } else {
                    difference = Vector2.ZERO_VECTOR;
                }
                if (difference != undefined) {
                    if (difference.equals(Vector2.ZERO_VECTOR)) {
                        collisionType = HORIZONTAL;
                    } else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) > 1) {
                        collisionType = HORIZONTAL;
                    } else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) < 1) {
                        collisionType = VERTICAL;
                    }
                }
                if (collisionType == HORIZONTAL) {
                    let newY;
                    if (totalVelocity.getY() > 0) {
                        newY = wallHitbox.y1 - this.height / 2;
                    } else if (totalVelocity.getY() < 0) {
                        newY = wallHitbox.y2 + this.height / 2
                    }
                    if (newY != undefined) {
                        this.position.setY(newY);
                        totalVelocity.setY(0);
                        console.log(this.position)
                    }
                } else if (collisionType == VERTICAL) {
                    let newX;
                    if (totalVelocity.getX() > 0) {
                        newX = wallHitbox.x1 - this.width / 2;
                    } else if (totalVelocity.getX() < 0) {
                        newX = wallHitbox.x2 + this.width / 2
                    }
                    if (newX != undefined) {
                        this.position.setX(newX);
                        totalVelocity.setX(0);
                        console.log(this.position)
                    }
                }
            }
        }
    }

    getClosestWalls() { // function to get the closest wall to the player
        let smallestDistance = undefined;
        let coordinates = [];
        for (let wall of this.arena.obstructions) {
            let distance = Math.sqrt((wall.getX() + 0.5 - this.position.getX()) ** 2 + (wall.getY() + 0.5 - this.position.getY()) ** 2);
            if (smallestDistance == undefined) {
                smallestDistance = distance;
                arrayPush(coordinates, wall);
            } else if (smallestDistance > distance) {
                smallestDistance = distance;
                coordinates = [];
                arrayPush(coordinates, wall);
            } else if (smallestDistance == distance) {
                arrayPush(coordinates, wall);
            }
        }
        return coordinates;
    }

    // method to draw player
    draw(context) {
        context.fillStyle = "black";
        const pixelCoords = this.arena.coordsToPixels(this.position);
        const unitLength = this.arena.getUnitLength();
        context.fillRect(pixelCoords.getX() - (unitLength * this.width / 2), pixelCoords.getY() - (unitLength * this.height / 2), unitLength * this.width, unitLength * this.height);
    }
}