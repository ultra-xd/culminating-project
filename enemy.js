"use strict";


// class for enemy
class Enemy {

    // set different types of enemies
    static ZOMBIE = 0;
    static SKELETON = 1;

    constructor(x, y, type, arena) {
        this.position = new Vector2(x, y); // set the position of the vectpr
        this.controlledVelocity = Vector2.ZERO_VECTOR; // set the velocity the enemy can control itself with
        this.forcedVelocity = Vector2.ZERO_VECTOR; // set the velocity the enemy cannot control
        this.recoveryFactor = 1/30;
        this.recoveryTicks = 0;
        this.forcedVelocityDifference = undefined;
        this.arena = arena; // set the arena so that collisions and player-enemy interactions can occur
        this.type = type; // set the type of enemy (zombie, skeleton)
        this.size = 0.5; // set the size of the enemy in tile units
        this.speed; // declare the enemy speed variable
        // zombies are slower than skeletons
        if (this.type == Enemy.ZOMBIE) { // check if the enemy is a zombie
            this.speed = 1; // set speed to zombie speed
        } else { // check if the enemy is a skeleton
            this.speed = Math.E * 2 / 3; // set speed to skeleton speed
        }
        this.health = 100;
        this.attackingForce = 5;
        this.attackCooldownLimit = 120;
        this.attackCooldown = 0;
        this.reach = 0.5;

        // skeleton variables
        this.shootingRange = 3;
        this.isShooting = false;
        this.shootingTicks = 0;
        this.shootingTicksLength = 120;
        this.shootingStrength = 5;
    }

    // function to update the enemy
    tick() {
        this.pathfindingAlgorithm = this.arena.getPlayer().getPathfindingAlgorithm(); // get the pathfinding algorithm for the enemy
        this.controlledVelocity = this.pathfindingAlgorithm.getDecimalVector(this.position).multiply(this.speed); // get the controlled velocity of the enemy based on pathfinding algorithm
        if (this.controlledVelocity == undefined || this.controlledVelocity.isUndefined()) { // check if the controlled velocity is valid
            this.controlledVelocity = Vector2.ZERO_VECTOR; // chnage to 0 vector velocity is velocity is undefined 
        }
        if (this.type == Enemy.SKELETON) {
            if (this.isShooting) {
                this.controlledVelocity = Vector2.ZERO_VECTOR;
            }
        }
        // console.log(this.controlledVelocity);
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
        let totalVelocity = this.controlledVelocity.add(this.forcedVelocity); // add together the forced velocity
        this.position = this.position.add(totalVelocity.divide(TPS)); // add velocity to position
        // check & handle collisions
        while (true) { // keep iterating until not colliding with any walls
            let closestWalls = this.getClosestWalls(); // get all walls closest to player
            let collided = false; // create a variable to keep track of if the player is collding with a wall
            for (let wall of closestWalls) { // check all closest walls
                let enemyHitbox = this.getHitbox(); // get player hitbox
                let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1); // get wall hitbox
                if (enemyHitbox.intersectsWith(wallHitbox)) { // check if player and wall hitbox overlap
                    collided = true; // update collided variable to show that collision occured
                    let collisionType; // declare collision type variable
                    let difference = undefined; // declare variable to check for the difference vector between the corner of the player hitbox and the corner of the wall where the collision occured
                    // check for the horizontal direction of the player velocity
                    if (totalVelocity.getX() > 0) { // check if the player is moving right
                        // check for the vertical direction of the player velocity
                        if (totalVelocity.getY() > 0) { // check if the player is moving up
                            difference = new Vector2(enemyHitbox.x2, enemyHitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1)); // find the difference vector between TR player and BL wall
                        } else if (totalVelocity.getY() < 0) {// check if the player is moving down
                            difference = new Vector2(enemyHitbox.x2, enemyHitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2)); // find the difference vector between BR player and TL wall
                        } else { // check if the player is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line (vertical lines are colliding)
                        }
                    } else if (totalVelocity.getX() < 0) { // check if player is moving left
                        // check for the vertical direction of the player velocity
                        if (totalVelocity.getY() > 0) { // check if the player is moving up
                            difference = new Vector2(enemyHitbox.x1, enemyHitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1)); // find the difference vector between TL player and BR wall
                        } else if (totalVelocity.getY() < 0) { // check if the player is moving down
                            difference = new Vector2(enemyHitbox.x1, enemyHitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2)); // find the difference vector between BL player and TR wall
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
        let playerPosition = this.arena.getPlayer().getPosition();
        if (this.type == Enemy.ZOMBIE) {
            this.attackCooldown++;
            if (playerPosition.subtract(this.position).getMagnitude() <= this.reach && this.attackCooldown >= this.attackCooldownLimit) {
                this.attackCooldown = 0;
                this.attackPlayer(10);
            }
        } else if (this.type == Enemy.SKELETON) {
            if (!this.isShooting) {
                if (playerPosition.subtract(this.position).getMagnitude() <= this.shootingRange) {
                    this.isShooting = true;
                    this.shootingTicks = 0;
                }
            } else {
                this.shootingTicks++;
                if (this.shootingTicks > this.shootingTicksLength) {
                    this.arena.launchArrow(this.position, playerPosition.subtract(this.position).unit().multiply(this.shootingStrength));
                    this.isShooting = false;
                }
            }
        }
        // console.log(this.position)
    }

    attackPlayer(damage) {
        let playerPosition = this.arena.getPlayer().getPosition();
        let directionVector = playerPosition.subtract(this.position);
        let forcedVelocity = directionVector.unit().multiply(this.attackingForce);
        this.arena.getPlayer().setForcedVelocity(forcedVelocity);
        this.arena.getPlayer().decreaseHealth(damage);
    }

    // function to get the closest walls to the enemy
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

    getPosition() {
        return this.position;
    }
    // function to return a rectangle representing the hitbox of the enemy
    getHitbox() {
        return new Rectangle(this.position.getX() - this.size / 2, this.position.getY() - this.size / 2, this.size, this.size); // return a rectangle object defining the hitbox of the player
    }

    getHealth() {
        return this.health;
    }

    decreaseHealth(damage) {
        this.health -= damage;
    }

    setForcedVelocity(velocity) {
        this.forcedVelocity = velocity;
    }

    // function to draw the enemy
    draw(context) {
        // console.log("drawing enemy")
        context.fillStyle = (this.type == Enemy.ZOMBIE) ? "red": "yellow";
        const pixelCoords = this.arena.coordsToPixels(this.position);
        const unitLength = this.arena.getUnitLength();
        context.fillRect(pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size);

        // draw health bar
        context.fillStyle = "red";
        context.fillRect(pixelCoords.getX() - unitLength * 2 / 3, pixelCoords.getY() - unitLength * 2 / 3, unitLength * 4 / 3, unitLength / 20);
        
        context.fillStyle = "green";
        context.fillRect(pixelCoords.getX() - unitLength * 2 / 3., pixelCoords.getY() - unitLength * 2 / 3, unitLength * 4 * (this.health / 100) / 3, unitLength / 20);
    }
}

class Arrow {
    constructor(position, velocity, arena) {
        this.position = position;
        this.initialPosition = position;
        this.velocity = velocity;
        this.arena = arena;
        this.size = 0.25;
        this.range = 8;
        this.despawnTimer = 0;
        this.despawnLimit = 600;
        this.isCollidedWithWall = false;
        this.isCollidedWithPlayer = false;
    }

    tick() {
        if (!this.isCollidedWithPlayer && !this.isCollidedWithWall) {
            this.position = this.position.add(this.velocity.divide(TPS));
        }
        if (!this.isCollidedWithWall) {
            let playerHitbox = this.arena.getPlayer().getHitbox();
            if (this.getHitbox().intersectsWith(playerHitbox)) {
                this.isCollidedWithPlayer = true;
                this.attackPlayer(10);
            }
        } else {
            this.despawnTimer++;
        }

        // check & handle wall collisions
        while (true) { // keep iterating until not colliding with any walls
            let closestWalls = this.getClosestWalls(); // get all walls closest to player
            let collided = false; // create a variable to keep track of if the player is collding with a wall
            for (let wall of closestWalls) { // check all closest walls
                let arrowHitbox = this.getHitbox(); // get player hitbox
                let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1); // get wall hitbox
                if (arrowHitbox.intersectsWith(wallHitbox)) { // check if player and wall hitbox overlap
                    this.isCollidedWithWall = true;
                    collided = true; // update collided variable to show that collision occured
                    let collisionType; // declare collision type variable
                    let difference = undefined; // declare variable to check for the difference vector between the corner of the player hitbox and the corner of the wall where the collision occured
                    // check for the horizontal direction of the player velocity
                    if (this.velocity.getX() > 0) { // check if the player is moving right
                        // check for the vertical direction of the player velocity
                        if (this.velocity.getY() > 0) { // check if the player is moving up
                            difference = new Vector2(arrowHitbox.x2, arrowHitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1)); // find the difference vector between TR player and BL wall
                        } else if (this.velocity.getY() < 0) {// check if the player is moving down
                            difference = new Vector2(arrowHitbox.x2, arrowHitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2)); // find the difference vector between BR player and TL wall
                        } else { // check if the player is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line (vertical lines are colliding)
                        }
                    } else if (this.velocity.getX() < 0) { // check if player is moving left
                        // check for the vertical direction of the player velocity
                        if (this.velocity.getY() > 0) { // check if the player is moving up
                            difference = new Vector2(arrowHitbox.x1, arrowHitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1)); // find the difference vector between TL player and BR wall
                        } else if (this.velocity.getY() < 0) { // check if the player is moving down
                            difference = new Vector2(arrowHitbox.x1, arrowHitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2)); // find the difference vector between BL player and TR wall
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
                        if (this.velocity.getY() > 0) { // check if player is moving up
                            newY = wallHitbox.y1 - this.size / 2; // set vertical player pos to the position directly on the bottom of the wall
                        } else if (this.velocity.getY() < 0) { // check if player is moving down
                            newY = wallHitbox.y2 + this.size / 2; // set vertical player pos to the position directly on the top of the wall
                        }
                        if (newY != undefined) { // check if the new vertical position is defined
                            this.position.setY(newY); // move player vertical position
                            this.velocity.setY(0); // set player vertical velocity to 0
                        }
                    }
                    // handle vertical & diagonal collisions
                    if (collisionType == VERTICAL || collisionType == DIAGONAL) { // check if collision is vertical or diagonal
                        let newX; // declare new variable for adjustment for player's x position
                        if (this.velocity.getX() > 0) { // check if player is moving right
                            newX = wallHitbox.x1 - this.size / 2; // set horizontal player pos to the position directly on the left of the wall
                        } else if (this.velocity.getX() < 0) { // check if the player is moving left
                            newX = wallHitbox.x2 + this.size / 2 // set horizontal player pos to the position directly on the right of the wall
                        }
                        if (newX != undefined) { // check if the new horizontal position is defined
                            this.position.setX(newX); // move player horizontal position
                            this.velocity.setX(0); // set player horizontal velocity to 0
                        }
                    }
                }
            }
            if (!collided) { // check if no collision occurs
                break; // exit loop
            }
        }
    }

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

    getHitbox() {
        return new Rectangle(this.position.getX() - this.size / 2, this.position.getY() - this.size / 2, this.size, this.size); // return a rectangle object defining the hitbox of the player
    }

    attackPlayer(damage) {
        let forcedVelocity = this.velocity;
        this.arena.getPlayer().setForcedVelocity(forcedVelocity);
        this.arena.getPlayer().decreaseHealth(damage);
    }

    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position);
        // console.log(pixelCoords)
        const unitLength = this.arena.getUnitLength();

        context.fillStyle = "blue";
        context.fillRect(pixelCoords.getX() - unitLength * this.size / 2, pixelCoords.getY() - unitLength * this.size / 2, unitLength * this.size, unitLength * this.size);
    }
    getIfCollidedWithWall() {
        return this.isCollidedWithWall;
    }
    getIfCollidedWithPlayer() {
        return this.isCollidedWithPlayer;
    }
    getDespawnTimer() {
        return this.despawnTimer;
    }
    getDespawnLimit() {
        return this.despawnLimit;
    }

    // get
}
