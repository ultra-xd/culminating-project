"use strict";

// class for player where the movement & collisions of player are tracked
class Player {
    constructor(x, y, arena) {
        this.arena = arena; // store the arena the player is in
        this.position = new Vector2(x, y); // create a position vector for the player
        this.size = 0.75; // store the size of the player in tile units (will be a square)
        this.controlledVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player can control to 0
        this.forcedVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player cannot control to 0
        this.forcedVelocityDifference = undefined;
        this.direction = "down"; // set the player direction to be facing downwards
        this.defaultSpeed = Math.E; // set the speed of the player
        this.pathfindingAlgorithm = new PathfindingAlgorithm(new Vector2(Math.floor(this.position.getX()), Math.floor(this.position.getY())), 20, this.arena); // create a pathfinding algorithm to the position of the player
        this.pathfindingAlgorithm.generateHeatMap(); // generate the pathfinding algorithm's heatmap
        this.pathfindingLastUpdated = 0; // integer to track when the pathfinding algorithm has last been updated
        this.animationFrame = 1; // set the frame id of the animation to be display
        this.animationTicks = 0; // set the tick count of the animation to track when to switch animation frames
        this.animationSpeed = 5; // set the number of frames between each animation frame
        this.isAOEAttacking = false;
        this.AOEAttackTicks = 0;
        this.isHeavyAttacking = false;
        this.heavyAttackTicks = 0;
        this.attackingEnemy = undefined;
        this.attackingAnimationFrame = 1;
        this.attackingForce = 15;
        this.reach = 2;
        this.health = 100;
        this.recoveryFactor = 1/20;
        this.isAlive = true;
    }

    // method to update the player every tick
    tick(buttonsPressed) {
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
        }
        if (this.isAlive) {
            this.controlledVelocity = Vector2.ZERO_VECTOR; // reset the controlled player velocity to 0
            if (!this.isAOEAttacking && !this.isHeavyAttacking) {
                for (let button of buttonsPressed) { // iterate through all keys that are pressed
                    if (button == "w") { // check if W key is being pressed
                        this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT); // increase velocity in positive Y direction
                    }
                    if (button == "d") { // check if D key is being pressed
                        this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT); // increase velocity in positive X direction
                    }
                    if (button == "a") { // check if A key is being pressed
                        this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT.multiply(-1)); // increase velocity in negative X direction
                    }
                    if (button == "s") { // check if S key is being pressed
                        this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT.multiply(-1)); // increase velocity in negative Y direction
                    }
                    if (button == "LMB1") {
                        this.isHeavyAttacking = true;
                    }
                    else if (button == "RMB1") {
                        this.isAOEAttacking = true;
                    }
                }
            }
            if (!this.forcedVelocity.equals(Vector2.ZERO_VECTOR)) {
                if (this.forcedVelocityDifference == undefined) {
                    this.forcedVelocityDifference = this.forcedVelocity.multiply(-1 * this.recoveryFactor);
                    this.recoveryTicks = 0;
                }
                this.forcedVelocity = this.forcedVelocity.add(this.forcedVelocityDifference);
                // console.log(this.forcedVelocityDifference);
                this.recoveryTicks++;
                if (this.recoveryTicks > 1 / this.recoveryFactor) {
                    this.forcedVelocity = Vector2.ZERO_VECTOR;
                    this.forcedVelocityDifference = undefined;
                }
            }
            this.controlledVelocity = (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) ? this.controlledVelocity.unit().multiply(this.defaultSpeed): Vector2.ZERO_VECTOR; // set controllable velocity to have magnitude of 1 if it is not 0
            let totalVelocity = this.controlledVelocity.add(this.forcedVelocity);
            this.position = this.position.add(this.controlledVelocity.add(this.forcedVelocity).divide(TPS)); // change position based on velocity

            // get the angle of the velocity of the player to correctly display the sprite of the player
            let angle = this.controlledVelocity.getAngle();
            if (angle != undefined) { // check if the angle exists
                if (Math.PI / 4 <= angle && angle <= 3 * Math.PI / 4) { // check if the player is looking up (45 & 135 degrees, inclusive)
                    this.direction = "up"; // set direction of player up
                }
                else if (3 * Math.PI / 4 < angle && angle < 5 * Math.PI / 4) { // check if the player is looking left (135 & 225 degrees, exclusive)
                    this.direction = "left"; // set direction of player left
                }
                else if (5 * Math.PI / 4 <= angle && angle <= 7 * Math.PI / 4) { // check if the player is looking down (225 & 315 degrees, exclusive)
                    this.direction = "down"; // set direction of player down
                }
                else { // otherwise, player is facing right
                    this.direction = "right"; // set direction of player right
                }
            }

            // check for collisions
            while (true) { // keep iterating until not colliding with any walls
                let closestWalls = this.getClosestWalls(); // get all walls closest to player
                let collided = false; // create a variable to keep track of if the player is collding with a wall
                for (let wall of closestWalls) { // check all closest walls
                    let playerHitbox = this.getHitbox(); // get player hitbox
                    let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1); // get wall hitbox
                    if (playerHitbox.intersectsWith(wallHitbox)) { // check if player and wall hitbox overlap
                        collided = true; // update collided variable to show that collision occured
                        let collisionType; // declare collision type variable
                        let difference = undefined; // declare variable to check for the difference vector between the corner of the player hitbox and the corner of the wall where the collision occured
                        // check for the horizontal direction of the player velocity
                        if (totalVelocity.getX() > 0) { // check if the player is moving right
                            // check for the vertical direction of the player velocity
                            if (totalVelocity.getY() > 0) { // check if the player is moving up
                                difference = new Vector2(playerHitbox.x2, playerHitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1)); // find the difference vector between TR player and BL wall
                            } else if (totalVelocity.getY() < 0) {// check if the player is moving down
                                difference = new Vector2(playerHitbox.x2, playerHitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2)); // find the difference vector between BR player and TL wall
                            } else { // check if the player is not vertically moving
                                collisionType = VERTICAL; // set collision type to be a vertical line (vertical lines are colliding)
                            }
                        } else if (totalVelocity.getX() < 0) { // check if player is moving left
                            // check for the vertical direction of the player velocity
                            if (totalVelocity.getY() > 0) { // check if the player is moving up
                                difference = new Vector2(playerHitbox.x1, playerHitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1)); // find the difference vector between TL player and BR wall
                            } else if (totalVelocity.getY() < 0) { // check if the player is moving down
                                difference = new Vector2(playerHitbox.x1, playerHitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2)); // find the difference vector between BL player and TR wall
                            } else { // check if the player is not vertically moving
                                collisionType = VERTICAL; // set collision type to be a vertical line 
                            }
                        } else { // check if the player is not moving horizontally
                            difference = Vector2.ZERO_VECTOR; // set difference to be a zero vector (player is only vertically moving) (this can be calculated, ratio between x & y will always be 0)
                        }
                        /*
                        a vertical collision is a collision between the vertical lines of two objects: will result in displacement in x-direction
                        a horizontal collision is a collision between the horizontal lines of two objects: will result in displacement in y-direction
                        a diagonal collision is a collision between the corners of two objects: will result in displacement in both x and y directions
                        */
                        if (difference != undefined) { // check if difference is not defined
                            if (difference.equals(Vector2.ZERO_VECTOR)) { // check if the difference is a zero vector
                                collisionType = HORIZONTAL; 
                            } 
                            // check for the ratio between the difference vector's x and y components to determine if collision type is horizontal or vertical
                            else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) > 1) { // check if the player is further collided in the x-direction than y-direction
                                collisionType = HORIZONTAL; // set collision type to horizontal
                            } else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) < 1) { // check if the player is further collided in the y-direction than x-direction
                                collisionType = VERTICAL; // set collision type to vertical
                            } else { // default to player being equally collided in x and y direction
                                collisionType = DIAGONAL; // set collision type to diagonal
                            }
                        }
                        // handle horizontal collisions & diagonal collisions
                        if (collisionType == HORIZONTAL || collisionType == DIAGONAL) { // check if collision is horizontal or diagonal
                            let newY; // declare new variable for adjustment for player's y position
                            if (totalVelocity.getY() > 0) { // check if player is moving up
                                newY = wallHitbox.y1 - this.size / 2; // set vertical player pos to the position directly on the bottom of the wall
                            } else if (totalVelocity.getY() < 0) { // check if player is moving down
                                newY = wallHitbox.y2 + this.size / 2; // set vertical player pos to the position directly on the top of the wall
                            }
                            if (newY != undefined) { // check if the new vertical position is defined
                                this.position.setY(newY); // move player vertical position
                                totalVelocity.setY(0); // set player vertical velocity to 0
                            }
                        }
                        // handle vertical & diagonal collisions
                        if (collisionType == VERTICAL || collisionType == DIAGONAL) { // check if collision is vertical or diagonal
                            let newX; // declare new variable for adjustment for player's x position
                            if (totalVelocity.getX() > 0) { // check if player is moving right
                                newX = wallHitbox.x1 - this.size / 2; // set horizontal player pos to the position directly on the left of the wall
                            } else if (totalVelocity.getX() < 0) { // check if the player is moving left
                                newX = wallHitbox.x2 + this.size / 2 // set horizontal player pos to the position directly on the right of the wall
                            }
                            if (newX != undefined) { // check if the new horizontal position is defined
                                this.position.setX(newX); // move player horizontal position
                                totalVelocity.setX(0); // set player horizontal velocity to 0
                            }
                        }
                    }
                }
                if (!collided) { // check if no collision occurs
                    break; // exit loop
                }
            }

            this.pathfindingLastUpdated++; // increase ticks since pathfinding has been updated
            if (this.pathfindingLastUpdated >= 10) { // check if 10 ticks have passed since pathfinding has been updated
                this.pathfindingLastUpdated = 0; // reset timer to 0
                this.pathfindingAlgorithm.setTarget(this.position); // update pathfinding by setting target to new position coordinates
            }

            if (this.isAOEAttacking) {
                this.AOEAttackTicks++;
                if (this.AOEAttackTicks == 1) {
                    this.attackingAnimationFrame = 1;
                    for (let enemy of this.arena.getEnemies()) {
                        let enemyPosition = enemy.getPosition();
                        let distance = enemyPosition.subtract(this.position).getMagnitude();
                        if (distance <= this.reach) {
                            this.attackEnemy(enemy, 10);
                        }
                    }
                }
                this.attackingAnimationFrame = Math.floor(this.AOEAttackTicks / this.animationSpeed) + 1;
                if (this.AOEAttackTicks >= 8 * this.animationSpeed) {
                    this.isAOEAttacking = false;
                    this.AOEAttackTicks = 0;
                }
            }
            else if (this.isHeavyAttacking) {
                this.heavyAttackTicks++;
                if (this.heavyAttackTicks == 1) {
                    this.attackingAnimationFrame = 1;
                    // console.log("1")
                    let coordsMousePosition = this.arena.getCoordinateMousePosition();
                    if (coordsMousePosition != undefined) {
                        // console.log("2")
                        if (this.position.subtract(coordsMousePosition).getMagnitude() <= this.reach) {
                            // console.log("3")
                            for (let enemy of this.arena.getEnemies()) {
                                if (enemy.getHitbox().pointIn(coordsMousePosition)) {
                                    this.attackEnemy(enemy, 20);
                                    // console.log("pressing on enemy");
                                    break;
                                }
                            }
                        }
                    }
                }
                this.attackingAnimationFrame = Math.floor(this.heavyAttackTicks / this.animationSpeed) + 1;
                if (this.attackingAnimationFrame > 8) {
                    this.isHeavyAttacking = false;
                    this.heavyAttackTicks = 0;
                }
            }

            if (!this.isAOEAttacking && !this.isHeavyAttacking) {
                if (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) { // check if the player is moving
                    this.animationTicks++; // increase ticks for animation tracking
                    if (this.animationTicks >= this.animationSpeed) { // check if 5 ticks have passed since the animation has updated
                        this.animationTicks = 0; // reset timer to 0
                        this.animationFrame++; // increase animation frame
                    }
                    if (this.animationFrame > 8) { // check if the animation frame is more than 8 (there are only 8 frames)
                        this.animationFrame = 1; // reset animation frame back to 1
                    }
                }
                else { // otherwise, player is not moving
                    this.animationTicks = 0; // set animation ticks to 0
                    this.animationFrame = 1; // set animation frame to 1 (idle animation)
                }
            }
            // console.log(this.health)
        }
    }
    attackEnemy(enemy, damage) {
        let enemyPosition = enemy.getPosition();
        let directionVector = enemyPosition.subtract(this.position);
        let distance = directionVector.getMagnitude();
        let forcedVelocity;
        if (distance != 0) {
            forcedVelocity = directionVector.unit().multiply(this.attackingForce - (this.attackingForce * distance / this.reach));
        } else {
            forcedVelocity = Vector2.J_UNIT.multiply(this.attackingForce);
        }
        enemy.setForcedVelocity(forcedVelocity);
        enemy.decreaseHealth(damage);
    }
    // method to return the hitbox of the player
    getHitbox() {
        return new Rectangle(this.position.getX() - this.size / 2, this.position.getY() - this.size / 2, this.size, this.size); // return a rectangle object defining the hitbox of the player
    }

     // function to get the closest walls to the player
    getClosestWalls() {
        let smallestDistance = undefined; // declare variable storing the smallest distance from any wall to player found so far
        let coordinates = []; // initalize array to store any coordinates of the closest walls
        for (let wall of this.arena.obstructions) { // iterate through all walls in the arena
            let distance = Math.sqrt((wall.getX() + 0.5 - this.position.getX()) ** 2 + (wall.getY() + 0.5 - this.position.getY()) ** 2); // get the distance from the center of the wall to the center of the player
            if (smallestDistance == undefined) { // check if there is a smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to player
                arrayPush(coordinates, wall); // add to array of walls
            } else if (smallestDistance > distance) { // check if the distance found is less than the smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to player
                coordinates = [wall]; // set array of coordinates to an array with only the wall
            } else if (smallestDistance == distance) {  // check if the distance found is equal to the smallest distance found
                arrayPush(coordinates, wall); // add to array of walls
            }
        }
        return coordinates; // return the list of walls closest to player
    }

    getPathfindingAlgorithm() {
        return this.pathfindingAlgorithm;
    }

    // method to draw player
    draw(context) {
        // context.fillStyle = "black";
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the position of the player on the screen
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player
        // context.fillRect(pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size);
        let file;
        if (this.isHeavyAttacking) {
            file = `files/assets/character/${this.direction}/${this.attackingAnimationFrame}${this.direction}attack.png`; // get player file sprite
        } else if (this.isAOEAttacking) {
            file = `files/assets/character/sweeping/${this.attackingAnimationFrame}sweepingattack.png`;
        } else {
            file = `files/assets/character/${this.direction}/${this.animationFrame}${this.direction}.png`; // get player file sprite
        }
        
        let image = IMAGE_LOADER[file]; // get the image associated with the file
        context.drawImage(image, pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size); // draw the sprite of the player

        // draw healthbar

        context.font = `${unitLength / 4}px Consolas`;
        context.fillStyle = "white";
        context.fillText("Health", unitLength / 2, unitLength / 3);

        context.fillStyle = "red";
        context.fillRect(unitLength / 2, unitLength / 2, unitLength * 5, unitLength / 10);
        
        context.fillStyle = "green";
        context.fillRect(unitLength / 2, unitLength / 2, unitLength * 5 * (this.health / 100), unitLength / 10);
    }

    getPosition() {
        return this.position;
    }

    getIfAlive() {
        return this.isAlive;
    }

    setForcedVelocity(velocity) {
        this.forcedVelocity = velocity;
        this.forcedVelocityDifference = undefined;
    }
    
    decreaseHealth(damage) {
        this.health -= damage;
    }
}