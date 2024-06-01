"use strict";

class Rectangle {
    constructor(x, y, width, height) {
        this.x1 = x;
        this.y1 = y;
        this.x2 = x + width;
        this.y2 = y + height;
    }

    intersectsWith(rectangle) {
        console.log(`1: ${this.toString()} 2:${rectangle.toString()}`)
        if (this.x1 < rectangle.x2 &&
            this.x2 > rectangle.x1 &&
            this.y1 < rectangle.y2 &&
            this.y2 > rectangle.y1
        ) {
            return true;
        }
        return false;
    }
    toString() {
        return `Rectangle(${this.x1},${this.y1},${this.x2}, ${this.y2})`;
    }
}
