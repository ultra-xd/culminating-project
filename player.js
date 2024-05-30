"use strict";

// class for player where the movement & collisions of player are tracked
class Player {
    constructor(x, y, arena) {
        this.arena = arena; // store the arena the player is in
        this.position = new Vector2(x, y); // create a position vector for the player
        this.width = 0.5; // store the width of the player in tile units
        this.height = 0.5; // store the height of the player in tile units
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
        this.controlledVelocity = (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) ? this.controlledVelocity.unit(): Vector2.ZERO_VECTOR; // set controllable velocity to have magnitude of 1 if it is not 0
        this.position = this.position.add(this.controlledVelocity.add(this.forcedVelocity).divide(TPS)); // change position based on velocity
    }

    // method to draw player
    draw(context) {
        context.fillStyle = "black";
        const pixelCoords = this.arena.coordsToPixels(this.position);
        const unitLength = this.arena.getUnitLength();
        context.fillRect(pixelCoords.getX() - (unitLength * this.width / 2), pixelCoords.getY() - (unitLength * this.height / 2), unitLength * this.width, unitLength * this.height);
    }
}