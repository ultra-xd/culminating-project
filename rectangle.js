"use strict";

// class for storing a rectangle shape on a 2D plane
class Rectangle {
    constructor(x, y, width, height) {
        this.x1 = x; // set x coordinate of left of rectangle
        this.y1 = y; // set y coordinate of bottom of rectangle
        this.x2 = x + width; // set x coordinate of right of rectangle
        this.y2 = y + height; // set y coordinate of top of rectangle
    }

    // function to check if another rectangle collides with another rectangle
    intersectsWith(rectangle) {
        /*
        to check if another rectangle intersects with another rectangle,
        1. the left of the 1st rectangle must be left of the right of the 2nd rectangle
        2. the right of the 1st rectangle must be right of the left of the 2nd rectangle
        3. the bottom of the 1st rectangle must lower than the top of the 2nd rectangle
        4. the top of the 1st rectangle must be higher than the bottom of the 2nd rectangle
        if all these requirements are met, the rectangles are intersecting
        */
        if (this.x1 < rectangle.x2 && // check for requirement #1
            this.x2 > rectangle.x1 && // check for requirement #2
            this.y1 < rectangle.y2 && // check for requirement #3
            this.y2 > rectangle.y1 // check for requirement #4
        ) {
            return true; // return that rectangles are intersecting
        }
        return false; // return that rectangles are not intersecting
    }
}
