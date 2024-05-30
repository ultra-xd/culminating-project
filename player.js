"use strict";

class Player {
    constructor(x, y, arena) {
        this.arena = arena;
        this.position = new Vector2(x, y);
        this.width = 0.5;
        this.height = 0.5;
        this.controlledVelocity = Vector2.ZERO_VECTOR;
        this.forcedVelocity = Vector2.ZERO_VECTOR;
        this.direction = "D";
    }

    tick(keysPressed) {
        console.log(keysPressed);
        this.controlledVelocity = Vector2.ZERO_VECTOR;
        for (let key of keysPressed) {
            if (key == "w") {
                console.log("e")
                this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT);
            }
            if (key == "d") {
                this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT);
            }
            if (key == "a") {
                this.controlledVelocity = this.controlledVelocity.add(Vector2.I_UNIT.multiply(-1));
            }
            if (key == "s") {
                this.controlledVelocity = this.controlledVelocity.add(Vector2.J_UNIT.multiply(-1));
            }
        }
        console.log(this.controlledVelocity);
        this.controlledVelocity = (!this.controlledVelocity.equals(Vector2.ZERO_VECTOR)) ? this.controlledVelocity.unit(): Vector2.ZERO_VECTOR;
        this.position = this.position.add(this.controlledVelocity.add(this.forcedVelocity).divide(TPS));
    }

    draw(context) {
        context.fillStyle = "black";
        const pixelCoords = this.arena.coordsToPixels(this.position);
        const unitLength = this.arena.getUnitLength();
        context.fillRect(pixelCoords.getX() - (unitLength * this.width / 2), pixelCoords.getY() - (unitLength * this.height / 2), unitLength * this.width, unitLength * this.height);
    }
}