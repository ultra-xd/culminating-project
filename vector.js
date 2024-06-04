"use strict";

// class for 2 dimensional vector
class Vector2 {
    static ZERO_VECTOR = new Vector2(0, 0); // create static variable for zero vector (0 in x direction, 0 in y direction)
    static I_UNIT = new Vector2(1, 0); // create static variable for basis unit vector i (1 in positive x direction)
    static J_UNIT = new Vector2(0, 1); // create static variable for basis unit vector j (1 in positive y direction)
    constructor(x, y) {
        this.x = x; // store x component
        this.y = y; // store y component
    }

    // method to get x component
    getX() {
        return this.x; // return x component
    }

    // method to get y component
    getY() {
        return this.y; // return y component
    }

    // method to get magnitude (length) of vector
    getMagnitude() {
        return Math.sqrt(this.x ** 2 + this.y ** 2); // use distance formula to determine magnitude of vector
    }

    // method to get angle of vector in standard position, returns an angle in radians (not degrees)
    getAngle() {
        // check if x and y components are 0
        if (this.x == 0 && this.y == 0) {
            return undefined; // return an undefined angle
        }
        // check if x component is 0
        if (this.x == 0) {
            if (this.y > 0) { // check if y component is larger than 0
                return Math.PI / 2; // return 90 degree angle
            }
            return 3 * Math.PI / 2; // otherwise, return 270 degree angle
        }
        // check if y component is 0
        if (this.y == 0) {
            if (this.x > 0) { // check if x component is larger than 0
                return 0; // return 0 degree angle
            }
            return Math.PI; // otherwise, return 180 degree angle
        }
        const angle = Math.atan(Math.abs(this.y) / Math.abs(this.x)); // get the reference angle by using inverse tangent function and x & y components
        // use CAST rule to find true angle
        if (this.x > 0 && this.y > 0) { // check if angle is in Q1
            return angle; // return the angle
        }
        if (this.x < 0 && this.y > 0) { // check if angle is in Q2
            return Math.PI - angle; // return 180 - angle
        }
        if (this.x < 0 && this.y < 0) { // check if angle is in Q3
            return Math.PI + angle; // return 180 + angle
        }
        return 2 * Math.PI - angle; // otherwise, angle is in Q4 and returns 360 - angle
    }
    
    // method to set x component
    setX(x) {
        this.x = x; // change x component
    }

    // method to set y component
    setY(y) {
        this.y = y; // change y component
    }

    // method to add two vectors together
    add(vector2) {
        return new Vector2(this.x + vector2.x, this.y + vector2.y); // return a vector where the x & y components are summed
    }

    // method to subtract two vectors
    subtract(vector2) {
        return new Vector2(this.x - vector2.x, this.y - vector2.y); // return a vector whose x & y components are the difference between 1st & 2nd vector
    }

    // method to divide vector by scalar
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar); // return a vector whose x & y components are multiplied by the scalar
    }

    // method to divide vector by scalar
    divide(scalar) {
        if (this.scalar == 0) { // check if the scalar is equal to 0
            return undefined; // return an undefined vector
        }
        return new Vector2(this.x / scalar, this.y / scalar); // return a vector whose x & y components are divided by the scalar
    }

    // method to return a unit vector in the same direction
    unit() {
        return this.divide(this.getMagnitude()); // return the unit vector (formula of unit vector: vector b / magnitude of b)
    }

    // method to return the dot product of two vectors
    dot(vector2) {
        return (this.x * vector2.x) + (this.y * vector2.y); // return the sum of the product of the two vector's components (formula of dot product: DP = a1b1 + a2b2)
    }

    // method to check if two vectors are equivalent
    equals(vector2) {
        return this.x == vector2.x && this.y == vector2.y; // return if corresponding vector components are equal
    }

    isUndefined() {
        return this.x == undefined || this.y == undefined || isNaN(this.x) || isNaN(this.y);
    }

    // static method to return a new vector based on polar form (magnitude & angle)
    static fromPolarForm(magnitude, angle) { // angle in radians
        return new Vector2(Math.cos(angle) * magnitude, Math.sin(angle) * magnitude); // return the vector with x & y components based on magnitude & direction (x = cosa * magnitude, y = sina * magnitude)
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }

    static sum(/**/) {
        let args = arguments;
        let vector = Vector2.ZERO_VECTOR;
        for (let v of args) {
            vector = v.add(vector);
        }
        return vector;
    }
}
