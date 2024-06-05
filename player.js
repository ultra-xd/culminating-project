"use strict";

// class for player where the movement & collisions of player are tracked
class Player {
    constructor(x, y, arena) {
        this.arena = arena; // store the arena the player is in
        this.position = new Vector2(x, y); // create a position vector for the player
        this.size = 1; // store the size of the player in tile units (will be a square)
        this.controlledVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player can control to 0
        this.forcedVelocity = Vector2.ZERO_VECTOR; // set the player velocity that the player cannot control to 0
        this.direction = "down"; // set the player direction to be facing downwards
        this.defaultSpeed = Math.E; // set the speed of the player
        this.pathfindingAlgorithm = new PathfindingAlgorithm(new Vector2(Math.floor(this.position.getX()), Math.floor(this.position.getY())), 15, this.arena); // create a pathfinding algorithm to the position of the player
        this.pathfindingAlgorithm.generateHeatMap(); // generate the pathfinding algorithm's heatmap
        this.pathfindingLastUpdated = 0; // integer to track when the pathfinding algorithm has last been updated
        this.animationFrame = 1; // set the frame id of the animation to be display
        this.animationTicks = 0; // set the tick count of the animation to track when to switch animation frames
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
            this.pathfindingAlgorithm.setTarget(new Vector2(Math.floor(this.position.getX()), Math.floor(this.position.getY()))); // update pathfinding by setting target to new position coordinates
        }
        if (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) { // check if the player is moving
            this.animationTicks++; // increase ticks for animation tracking
            if (this.animationTicks >= 5) { // check if 5 ticks have passed since the animation has updated
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

        let file = `files/assets/character/${this.direction}/${this.animationFrame}${this.direction}.png`; // get player file sprite
        let image = IMAGE_LOADER[file]; // get the image associated with the file
        context.drawImage(image, pixelCoords.getX() - (unitLength * this.size / 2), pixelCoords.getY() - (unitLength * this.size / 2), unitLength * this.size, unitLength * this.size); // draw the sprite of the player
    }
}