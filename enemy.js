"use strict";


// class for enemy
class Enemy {

    // set different types of enemies to constants
    static ZOMBIE = 0;
    static SKELETON = 1;

    constructor(x, y, type, arena) {
        this.position = new Vector2(x, y); // set the position of the vectpr
        this.controlledVelocity = Vector2.ZERO_VECTOR; // set the velocity the enemy can control itself with
        this.forcedVelocity = Vector2.ZERO_VECTOR; // set the velocity the enemy cannot control
        this.recoveryFactor = 1/30; // set recovery factor (how much it recovers from a forced velocity change)
        this.recoveryTicks = 0; // set recovery ticks to 0 to track how long the enemy will recover
        this.forcedVelocityDifference = undefined; // set the forced velocity difference (the velocity that the enemy will take to recover from a forced velocity change)
        this.arena = arena; // set the arena so that collisions and player-enemy interactions can occur
        this.type = type; // set the type of enemy (zombie, skeleton)
        this.size = 0.5; // set the size of the enemy in tile units
        this.displaySize = 0.75; // set the display size of the enemy in tile units
        this.speed; // declare the enemy speed variable
        // zombies are slower than skeletons
        if (this.type == Enemy.ZOMBIE) { // check if the enemy is a zombie
            this.speed = 1; // set speed to zombie speed
        } else { // check if the enemy is a skeleton
            this.speed = Math.E * 2 / 3; // set speed to skeleton speed
        }
        this.health = 100; // set enemy health to 100
        this.attackingForce = 5; // set attacking force to 5 (how much knockback the player will take from a hit)
        this.attackCooldownLimit = 120; // set attack cooldown to 120 ticks
        this.attackCooldown = 0; // set ticks since last attack to 0
        this.reach = 0.5; // set distance from which enemy can attack to 0.5

        // skeleton variables
        this.shootingRange = 3; // set distance from which skeleton starts shooting to 3 tiles
        this.isShooting = false; // track when skeleton is shooting
        this.shootingTicks = 0; // track how long it has been since the skeleton started shooting
        this.shootingTicksMax = 120; // set number of ticks the skeleton takes to shoot to 120
        this.shootingStrength = 5; // set how fast the arrow goes when the skeleton shoots
        this.shootingAnimationPhase = 1; // set animation phase of skeleton shooting

        // animation variables
        this.animationTicks = 0; // set number of animation ticks to 0 (5 animation ticks per frame)
        this.animationPhase = 1; // set animation phase to 1st frame 
        this.animationSpeed = 5; // set number of ticks per animation phase to 5
        this.direction = "down"; // set direction of enemy to down
    }

    // function to update the enemy
    tick() {
        this.pathfindingAlgorithm = this.arena.getPlayer().getPathfindingAlgorithm(); // get the pathfinding algorithm for the enemy
        this.controlledVelocity = this.pathfindingAlgorithm.getDecimalVector(this.position).multiply(this.speed); // get the controlled velocity of the enemy based on pathfinding algorithm
        if (this.controlledVelocity == undefined || this.controlledVelocity.isUndefined()) { // check if the controlled velocity is valid
            this.controlledVelocity = Vector2.ZERO_VECTOR; // chnage to 0 vector velocity is velocity is undefined 
        }
        if (this.type == Enemy.SKELETON) { // check if enemy is a skeleton
            if (this.isShooting) { // check if the skeleton is shooting
                this.controlledVelocity = Vector2.ZERO_VECTOR; // set velocity to 0
            }
        }
        let angle; // declare angle variable
        if (this.controlledVelocity != Vector2.ZERO_VECTOR) { // check if the enemy is moving
            angle = this.controlledVelocity.getAngle(); // set angle to the direction the enemy is moving
        } else { // otherwise, enemy is not moving
            angle = this.arena.getPlayer().getPosition().subtract(this.position).getAngle(); // set angle to the direction of the player from enemy
        }
        if (Math.PI / 4 <= angle && angle <= 3 * Math.PI / 4) { // check if the enemy is looking up (45 & 135 degrees, inclusive)
            this.direction = "up"; // set direction of enemy up
        }
        else if (3 * Math.PI / 4 < angle && angle < 5 * Math.PI / 4) { // check if the enemy is looking left (135 & 225 degrees, exclusive)
            this.direction = "left"; // set direction of enemy left
        }
        else if (5 * Math.PI / 4 <= angle && angle <= 7 * Math.PI / 4) { // check if the enemy is looking down (225 & 315 degrees, exclusive)
            this.direction = "down"; // set direction of enemy down
        }
        else { // otherwise, enemy is facing right
            this.direction = "right"; // set direction of enemy right
        }

        // recovery from forced velocity to create smooth knockback
        if (!this.forcedVelocity.equals(Vector2.ZERO_VECTOR)) { // check if there is forced velocity 
            if (this.forcedVelocityDifference == undefined) { // check if the amount to recover from forced velocity has been defined
                this.forcedVelocityDifference = this.forcedVelocity.multiply(-1 * this.recoveryFactor); // create recovery vector from forced velocity weaker than that of forced velocity (depends on recovery factor) in opposite direction
                this.recoveryTicks = 0; // set number of recovery ticks to 0
            }
            this.forcedVelocity = this.forcedVelocity.add(this.forcedVelocityDifference); // recover slightly from forced velocity

            this.recoveryTicks++; // increase recovery ticks
            if (this.recoveryTicks > 1 / this.recoveryFactor) { // check if recovery ticks is higher than the number of ticks required to recover from
                this.forcedVelocity = Vector2.ZERO_VECTOR; // set forced velocity to 0
                this.forcedVelocityDifference = undefined; // stop recovering
            }
        }
        let totalVelocity = this.controlledVelocity.add(this.forcedVelocity); // add together the forced velocity & controlled velocity
        this.position = this.position.add(totalVelocity.divide(TPS)); // add velocity to position
        // check & handle collisions
        while (true) { // keep iterating until not colliding with any walls
            let closestWalls = this.getClosestWalls(); // get all walls closest to enemy
            let collided = false; // create a variable to keep track of if the enemy is collding with a wall
            for (let wall of closestWalls) { // check all closest walls
                let enemyHitbox = this.getHitbox(); // get enemy hitbox
                let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1); // get wall hitbox
                if (enemyHitbox.intersectsWith(wallHitbox)) { // check if enemy and wall hitbox overlap
                    collided = true; // update collided variable to show that collision occured
                    let collisionType; // declare collision type variable
                    let difference = undefined; // declare variable to check for the difference vector between the corner of the enemy hitbox and the corner of the wall where the collision occured
                    // check for the horizontal direction of the enemy velocity
                    if (totalVelocity.getX() > 0) { // check if the enemy is moving right
                        // check for the vertical direction of the enemy velocity
                        if (totalVelocity.getY() > 0) { // check if the enemy is moving up
                            difference = new Vector2(enemyHitbox.x2, enemyHitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1)); // find the difference vector between TR enemy and BL wall
                        } else if (totalVelocity.getY() < 0) {// check if the enemy is moving down
                            difference = new Vector2(enemyHitbox.x2, enemyHitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2)); // find the difference vector between BR enemy and TL wall
                        } else { // check if the enemy is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line (vertical lines are colliding)
                        }
                    } else if (totalVelocity.getX() < 0) { // check if enemy is moving left
                        // check for the vertical direction of the enemy velocity
                        if (totalVelocity.getY() > 0) { // check if the enemy is moving up
                            difference = new Vector2(enemyHitbox.x1, enemyHitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1)); // find the difference vector between TL enemy and BR wall
                        } else if (totalVelocity.getY() < 0) { // check if the enemy is moving down
                            difference = new Vector2(enemyHitbox.x1, enemyHitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2)); // find the difference vector between BL enemy and TR wall
                        } else { // check if the enemy is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line 
                        }
                    } else { // check if the enemy is not moving horizontally
                        difference = Vector2.ZERO_VECTOR; // set difference to be a zero vector (enemy is only vertically moving) (this can be calculated, ratio between x & y will always be 0)
                    }
                    /*
                    a vertical collision is a collision between the vertical lines of two objects: will result in displacement in x-direction
                    a horizontal collision is a collision between the horizontal lines of two objects: will result in displacement in y-direction
                    a diagonal collision is a collision between the corners of two objects: will result in displacement in both x and y directions
                    */
                    if (difference != undefined) { // check if difference is not defined
                        if (difference.equals(Vector2.ZERO_VECTOR)) { // check if the difference is a zero vector
                            collisionType = HORIZONTAL; // set collision type to horizontal
                        } 
                        // check for the ratio between the difference vector's x and y components to determine if collision type is horizontal or vertical
                        else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) > 1) { // check if the enemy is further collided in the x-direction than y-direction
                            collisionType = HORIZONTAL; // set collision type to horizontal
                        } else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) < 1) { // check if the enemy is further collided in the y-direction than x-direction
                            collisionType = VERTICAL; // set collision type to vertical
                        } else { // default to enemy being equally collided in x and y direction
                            collisionType = DIAGONAL; // set collision type to diagonal
                        }
                    }
                    // handle horizontal collisions & diagonal collisions
                    if (collisionType == HORIZONTAL || collisionType == DIAGONAL) { // check if collision is horizontal or diagonal
                        let newY; // declare new variable for adjustment for player's y position
                        if (totalVelocity.getY() > 0) { // check if enemy is moving up
                            newY = wallHitbox.y1 - this.size / 2; // set vertical enemy pos to the position directly on the bottom of the wall
                        } else if (totalVelocity.getY() < 0) { // check if enemy is moving down
                            newY = wallHitbox.y2 + this.size / 2; // set vertical enemy pos to the position directly on the top of the wall
                        }
                        if (newY != undefined) { // check if the new vertical position is defined
                            this.position.setY(newY); // move enemy vertical position
                            totalVelocity.setY(0); // set enemy vertical velocity to 0
                        }
                    }
                    // handle vertical & diagonal collisions
                    if (collisionType == VERTICAL || collisionType == DIAGONAL) { // check if collision is vertical or diagonal
                        let newX; // declare new variable for adjustment for enemy's x position
                        if (totalVelocity.getX() > 0) { // check if enemy is moving right
                            newX = wallHitbox.x1 - this.size / 2; // set horizontal enemy pos to the position directly on the left of the wall
                        } else if (totalVelocity.getX() < 0) { // check if the enemy is moving left
                            newX = wallHitbox.x2 + this.size / 2 // set horizontal enemy pos to the position directly on the right of the wall
                        }
                        if (newX != undefined) { // check if the new horizontal position is defined
                            this.position.setX(newX); // move enemy horizontal position
                            totalVelocity.setX(0); // set enemy horizontal velocity to 0
                        }
                    }
                }
            }
            if (!collided) { // check if no collision occurs
                break; // exit loop
            }
        }

        // get the player position on the arena
        let playerPosition = this.arena.getPlayer().getPosition();

        // check if the enemy is a zombie
        if (this.type == Enemy.ZOMBIE) {
            this.attackCooldown++; // add to attack cooldown
            if (playerPosition.subtract(this.position).getMagnitude() <= this.reach && this.attackCooldown >= this.attackCooldownLimit) { // check if the player is within reach to attack & the attack cooldown has passed
                this.attackCooldown = 0; // reset attack cooldown
                this.attackPlayer(10); // attack player for damage
            }
        } else if (this.type == Enemy.SKELETON) { // check if the enemy is a skeleton
            if (!this.isShooting) { // check if the skeleton is not shooting
                if (playerPosition.subtract(this.position).getMagnitude() <= this.shootingRange) { // check if the player is within range to be shot
                    this.isShooting = true; // start shooting
                    this.shootingTicks = 0; // reset shooting ticks
                }
            }
            if (this.isShooting) { // check if skeleton is shooting
                this.shootingTicks++; // increase shooting ticks
                if (this.shootingTicks >= this.shootingTicksMax) { // check if the skeleton has surpassed necessary ticks to shoot
                    this.arena.launchArrow(this.position, playerPosition.subtract(this.position).unit().multiply(this.shootingStrength)); // shoot an arrow in the direction of player with specified strength
                    this.isShooting = false; // stop shooting
                }
            }
        }
        // create animations for enemy
        if (!this.isShooting) { // check if enemy is not shooting
            this.animationTicks++; // increase animation ticks
            if (this.animationTicks >= this.animationSpeed) { // check if animation ticks is larger than # of ticks per frame
                this.animationPhase++; // increase animation frame
                this.animationTicks = 0; // reset animation ticks
                if (this.animationPhase > 8) { // check if animation phase is larger than # of frames
                    this.animationPhase = 1; // reset animation phase back to 1
                }
            }
        } else { // otherwise, enemy is a skeleton and it is shooting
            this.shootingAnimationPhase = Math.floor(this.shootingTicks / 40) + 1; // set animation phase according to how long the skeleton has shot for (3 shooting frames, 120 ticks means 40 ticks per frame)
        }
    }

    // method to attack player as zombie
    attackPlayer(damage) {
        let playerPosition = this.arena.getPlayer().getPosition(); // get player position
        let directionVector = playerPosition.subtract(this.position); // get direction vector from enemy to player
        let forcedVelocity = directionVector.unit().multiply(this.attackingForce); // get the forced velocity of the player
        this.arena.getPlayer().setForcedVelocity(forcedVelocity); // set forced velocity of player
        this.arena.getPlayer().decreaseHealth(damage); // decrease health of player
    }

    // function to get the closest walls to the enemy
    getClosestWalls() {
        let smallestDistance = undefined; // declare variable storing the smallest distance from any wall to enemy found so far
        let coordinates = []; // initalize array to store any coordinates of the closest walls
        for (let wall of arrayCombine(this.arena.obstructions, this.arena.getTowerPositions())) { // iterate through all walls in the arena
            let distance = Math.sqrt((wall.getX() + 0.5 - this.position.getX()) ** 2 + (wall.getY() + 0.5 - this.position.getY()) ** 2); // get the distance from the center of the wall to the center of the enemy
            if (smallestDistance == undefined) { // check if there is a smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to enemy
                arrayPush(coordinates, wall); // add to array of walls
            } else if (smallestDistance > distance) { // check if the distance found is less than the smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to enemy
                coordinates = [wall]; // set array of coordinates to an array with only the wall
            } else if (smallestDistance == distance) {  // check if the distance found is equal to the smallest distance found
                arrayPush(coordinates, wall); // add to array of walls
            }
        }
        return coordinates; // return the list of walls closest to enemy
    }

    // method to get position of enemy
    getPosition() {
        return this.position; // return position of enemy
    }
    // method to return a rectangle representing the hitbox of the enemy
    getHitbox() {
        return new Rectangle(this.position.getX() - this.size / 2, this.position.getY() - this.size / 2, this.size, this.size); // return a rectangle object defining the hitbox of the player
    }

    // method to get the health of the enemy
    getHealth() {
        return this.health; // return health of enemy
    }
    
    // method to decrease the health of enemy given amount of damage
    decreaseHealth(damage) {
        this.health -= damage; // decrease health by amount of damage
    }

    // method to set the forced velocity of the enemy
    setForcedVelocity(velocity) {
        this.forcedVelocity = velocity; // set forced velocity of enemy
        this.forcedVelocityDifference = undefined; // reset recovery velocity
    }

    // function to draw the enemy
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position); // get the pixel coordinates of the enemy
        const unitLength = this.arena.getUnitLength(); // get # of pixels per tile
        let texture; // declare sprite variable for enemy
        if (this.type == Enemy.ZOMBIE) { // check if the enemy is a zombie
            texture = IMAGE_LOADER[`files/assets/enemies/zombie/${this.direction}/${this.animationPhase}${this.direction}.png`]; // set the sprite to that of the zombie based on animation
        } 
        else { // otherwise, enemy is a skeleton
            if (!this.isShooting) { // check if the enemy is not shooting
                texture = IMAGE_LOADER[`files/assets/enemies/skeleton/${this.direction}/${this.animationPhase}${this.direction}.png`]; // set the sprite to that of the skeleton when it is not shooting based on animation phase
            } else { // otherwise, enemy is shooting
                texture = IMAGE_LOADER[`files/assets/enemies/skeleton/${this.direction}/${this.shootingAnimationPhase}shooting${this.direction}.png`]; // set the sprite to that of the skeleton when it is shooting based on animation phase of shooting
            }  
        }
        context.drawImage(texture, pixelCoords.getX() - (unitLength * this.displaySize / 2), pixelCoords.getY() - (unitLength * this.displaySize / 2), unitLength * this.displaySize, unitLength * this.displaySize); // draw the sprite
        

        // draw health bar
        context.fillStyle = "red"; // set colour of rectangle to be drawn to red
        context.fillRect(pixelCoords.getX() - unitLength * 2 / 3, pixelCoords.getY() - unitLength * 2 / 3, unitLength * 4 / 3, unitLength / 20); // draw a rectangle covering the entire background of the health bar
        
        context.fillStyle = "green"; // set colour of rectangle to be drawn to green
        context.fillRect(pixelCoords.getX() - unitLength * 2 / 3., pixelCoords.getY() - unitLength * 2 / 3, unitLength * 4 * (this.health / 100) / 3, unitLength / 20); // draw a rectangle filling in only a fraction of that of the red bar based on how much health the enemy has
    }
}

// class for an arrow
class Arrow {
    // create the sprite for the arrow in advance
    static TEXTURE = IMAGE_LOADER["files/assets/textures/non-animated/arrow.png"];
    constructor(position, velocity, arena) {
        this.position = position; // set position of arrow
        this.initialPosition = position; // initial position of arrow to that of the position when first intialized
        this.velocity = velocity; // set velocity of arrow
        this.angle = this.velocity.getAngle(); // get the angle of the arrow
        this.TEXTURE_DEFAULT_DIRECTION = Math.PI * 5 / 4; // set the default direction of the texture when it is drawn without applying rotation effects
        this.arena = arena; // store the arena the arrow is in
        this.size = 0.25; // store the size of the hitbox of the arrow
        this.despawnTimer = 0; // set despawn timer of arrow to 0 so that when the arrow hits the wall without doing anything, the arena will delete the arrow
        this.despawnLimit = 600; // set the number of ticks the arrow can exist for without doing anything
        this.isCollidedWithWall = false; // store whether or not the arrow has collided with a wall yet
        this.isCollidedWithPlayer = false; // store whether or not the arrow has collided with the player
        this.damage = 10; // set damage done to player to 10
    }

    // method to update arrow
    tick() {
        if (!this.isCollidedWithPlayer && !this.isCollidedWithWall) { // check if no collisions have occured yet
            this.position = this.position.add(this.velocity.divide(TPS)); // update position based on velocity
        }
        if (!this.isCollidedWithWall) { // check if the arrow hasnt collided with a wall yet
            let playerHitbox = this.arena.getPlayer().getHitbox(); // get the player hitbox
            if (this.getHitbox().intersectsWith(playerHitbox)) { // check if the hitbox collides with player hitbox
                this.isCollidedWithPlayer = true; // register that arrow has collided with player
                this.attackPlayer(this.damage); // attack the player
            }
        } else { // otherwise, arrow has collided with wall
            this.despawnTimer++; // increase despawn timer
        }

        // check & handle wall collisions
        while (true) { // keep iterating until not colliding with any walls
            let closestWalls = this.getClosestWalls(); // get all walls closest to arrow
            let collided = false; // create a variable to keep track of if the arrow is collding with a wall
            for (let wall of closestWalls) { // check all closest walls
                let arrowHitbox = this.getHitbox(); // get arrow hitbox
                let wallHitbox = new Rectangle(wall.getX(), wall.getY(), 1, 1); // get wall hitbox
                if (arrowHitbox.intersectsWith(wallHitbox)) { // check if arrow and wall hitbox overlap
                    this.isCollidedWithWall = true;
                    collided = true; // update collided variable to show that collision occured
                    let collisionType; // declare collision type variable
                    let difference = undefined; // declare variable to check for the difference vector between the corner of the arrow hitbox and the corner of the wall where the collision occured
                    // check for the horizontal direction of the arrow velocity
                    if (this.velocity.getX() > 0) { // check if the arrow is moving right
                        // check for the vertical direction of the arrow velocity
                        if (this.velocity.getY() > 0) { // check if the arrow is moving up
                            difference = new Vector2(arrowHitbox.x2, arrowHitbox.y2).subtract(new Vector2(wallHitbox.x1, wallHitbox.y1)); // find the difference vector between TR arrow and BL wall
                        } else if (this.velocity.getY() < 0) {// check if the arrow is moving down
                            difference = new Vector2(arrowHitbox.x2, arrowHitbox.y1).subtract(new Vector2(wallHitbox.x1, wallHitbox.y2)); // find the difference vector between BR arrow and TL wall
                        } else { // check if the arrow is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line (vertical lines are colliding)
                        }
                    } else if (this.velocity.getX() < 0) { // check if arrow is moving left
                        // check for the vertical direction of the arrow velocity
                        if (this.velocity.getY() > 0) { // check if the arrow is moving up
                            difference = new Vector2(arrowHitbox.x1, arrowHitbox.y2).subtract(new Vector2(wallHitbox.x2, wallHitbox.y1)); // find the difference vector between TL arrow and BR wall
                        } else if (this.velocity.getY() < 0) { // check if the arrow is moving down
                            difference = new Vector2(arrowHitbox.x1, arrowHitbox.y1).subtract(new Vector2(wallHitbox.x2, wallHitbox.y2)); // find the difference vector between BL arrow and TR wall
                        } else { // check if the arrow is not vertically moving
                            collisionType = VERTICAL; // set collision type to be a vertical line 
                        }
                    } else { // check if the arrow is not moving horizontally
                        difference = Vector2.ZERO_VECTOR; // set difference to be a zero vector (arrow is only vertically moving) (this can be calculated, ratio between x & y will always be 0)
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
                        else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) > 1) { // check if the arrow is further collided in the x-direction than y-direction
                            collisionType = HORIZONTAL; // set collision type to horizontal
                        } else if (Math.abs(difference.getX()) / Math.abs(difference.getY()) < 1) { // check if the arrow is further collided in the y-direction than x-direction
                            collisionType = VERTICAL; // set collision type to vertical
                        } else { // default to arrow being equally collided in x and y direction
                            collisionType = DIAGONAL; // set collision type to diagonal
                        }
                    }
                    // handle horizontal collisions & diagonal collisions
                    if (collisionType == HORIZONTAL || collisionType == DIAGONAL) { // check if collision is horizontal or diagonal
                        let newY; // declare new variable for adjustment for player's y position
                        if (this.velocity.getY() > 0) { // check if arrow is moving up
                            newY = wallHitbox.y1 - this.size / 2; // set vertical arrow pos to the position directly on the bottom of the wall
                        } else if (this.velocity.getY() < 0) { // check if arrow is moving down
                            newY = wallHitbox.y2 + this.size / 2; // set vertical arrow pos to the position directly on the top of the wall
                        }
                        if (newY != undefined) { // check if the new vertical position is defined
                            this.position.setY(newY); // move arrow vertical position
                            this.velocity.setY(0); // set arrow vertical velocity to 0
                        }
                    }
                    // handle vertical & diagonal collisions
                    if (collisionType == VERTICAL || collisionType == DIAGONAL) { // check if collision is vertical or diagonal
                        let newX; // declare new variable for adjustment for arrow's x position
                        if (this.velocity.getX() > 0) { // check if arrow is moving right
                            newX = wallHitbox.x1 - this.size / 2; // set horizontal arrow pos to the position directly on the left of the wall
                        } else if (this.velocity.getX() < 0) { // check if the arrow is moving left
                            newX = wallHitbox.x2 + this.size / 2 // set horizontal arrow pos to the position directly on the right of the wall
                        }
                        if (newX != undefined) { // check if the new horizontal position is defined
                            this.position.setX(newX); // move arrow horizontal position
                            this.velocity.setX(0); // set arrow horizontal velocity to 0
                        }
                    }
                }
            }
            if (!collided) { // check if no collision occurs
                break; // exit loop
            }
        }
    }

    // method to get closest walls to arrow
    getClosestWalls() {
        let smallestDistance = undefined; // declare variable storing the smallest distance from any wall to arrow found so far
        let coordinates = []; // initalize array to store any coordinates of the closest walls
        for (let wall of arrayCombine(this.arena.obstructions, this.arena.getTowerPositions())) { // iterate through all walls in the arena
            let distance = Math.sqrt((wall.getX() + 0.5 - this.position.getX()) ** 2 + (wall.getY() + 0.5 - this.position.getY()) ** 2); // get the distance from the center of the wall to the center of the arrow
            if (smallestDistance == undefined) { // check if there is a smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to arrow
                arrayPush(coordinates, wall); // add to array of walls
            } else if (smallestDistance > distance) { // check if the distance found is less than the smallest distance found so far
                smallestDistance = distance; // set the smallest distance value to the distance from the wall to arrow
                coordinates = [wall]; // set array of coordinates to an array with only the wall
            } else if (smallestDistance == distance) {  // check if the distance found is equal to the smallest distance found
                arrayPush(coordinates, wall); // add to array of walls
            }
        }
        return coordinates; // return the list of walls closest to arrow
    }

    // method to get hitbox of arrow
    getHitbox() {
        return new Rectangle(this.position.getX() - this.size / 2, this.position.getY() - this.size / 2, this.size, this.size); // return a rectangle object defining the hitbox of the arrow
    }

    // method to attack player
    attackPlayer(damage) {
        let forcedVelocity = this.velocity; // set the forced velocity of player to arrow velocity
        this.arena.getPlayer().setForcedVelocity(forcedVelocity); // set forced velocity
        this.arena.getPlayer().decreaseHealth(damage); // decrease health of player
    }

    // method to draw arrow
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(this.position); // get pixel coordinates of arrow
        const unitLength = this.arena.getUnitLength(); // get the # of pixels in one tile

        // rotate the image of the arrow so that tip goes in direction of velocity of arrow
        context.translate(pixelCoords.getX(), pixelCoords.getY()); // set center of rotation to the center of the arrow
        context.rotate((this.angle - this.TEXTURE_DEFAULT_DIRECTION) * -1); // rotate the arrow
        context.translate(-1 * pixelCoords.getX(), -1 * pixelCoords.getY()); // undo the center of rotation

        context.drawImage(Arrow.TEXTURE, pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size); // draw the arrow
        context.setTransform(1, 0, 0, 1, 0, 0); // reset the rotation by resetting matrix
    }

    // method to get if the arrow has collided with wall
    getIfCollidedWithWall() {
        return this.isCollidedWithWall; // return if the arrow is collided with the wall
    }

    // method to get if the arrow has collided with player
    getIfCollidedWithPlayer() {
        return this.isCollidedWithPlayer; // return if the arrow is collided with the player
    }

    // method to get the despawn timer of the arrow
    getDespawnTimer() {
        return this.despawnTimer; // return the despawn timer of the arrow
    }

    // method to get the maximum despawn limit of the arrow
    getDespawnLimit() {
        return this.despawnLimit; // return despawn limit
    }
}
