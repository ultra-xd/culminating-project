"use strict";

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    getMagnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    getAngle() {
        if (this.x == 0 && this.y == 0) {
            return undefined;
        }
        if (this.x == 0) {
            if (this.y > 0) {
                return Math.PI / 2;
            }
            return 3 * Math.PI / 2;
        }
        if (this.y == 0) {
            if (this.x > 0) {
                return 0;
            }
            return Math.PI;
        }
        const angle = Math.atan(Math.abs(this.y) / Math.abs(this.x));
        if (this.x > 0 && this.y > 0) {
            return angle;
        }
        if (this.x < 0 && this.y > 0) {
            return Math.PI - angle;
        }
        if (this.x < 0 && this.y < 0) {
            return Math.PI + angle;
        }
        return 2 * Math.PI - angle;
    }

    setX(x) {
        this.x = x;
    }

    setY(y) {
        this.y = y;
    }

    add(vector2) {
        return new Vector2(this.x + vector2.x, this.y + vector2.y);
    }

    subtract(vector2) {
        return new Vector2(this.x - vector2.x, this.y - vector2.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    divide(scalar) {
        return new Vector2(this.x / scalar, this.y / scalar);
    }

    dot(vector2) {
        return (this.x * vector2.x) + (this.y * vector2.y);
    }

    static fromPolarForm(magnitude, angle) { // angle in radians
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude);
    }
}

