"use strict";

// class for timer
class Timer {
    constructor(arena) {
        this.arena = arena; // store the arena
        this.ticks = 0; // store number of ticks
    }

    // method to update timer
    tick() {
        if (this.arena.getPlayer().getIfAlive()) { // check if player is alive
            this.ticks++; // increase # of ticks
        }
    }

    // method to draw timer
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(new Vector2(0, 0)); // get the position of the player on the screen
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player
        const textSize = unitLength / 4; // create variable for size of text
        context.fillStyle = "white"; // set font colour to white
        context.fontStyle = `${textSize}px Consolas`; // set size of text & font

        const stringDisplay = this.getString(); // get string representation of time that passed

        const padding = unitLength / 4; // create amount of space between borders and text
        context.fillText(stringDisplay, pixelCoords.getX() + padding, pixelCoords.getY() - padding); // display text
    }

    // method to turn # of ticks to minutes & seconds format
    getString() {
        let seconds = Math.floor(this.ticks / TPS); // get total number of seconds passed
        let minutes = Math.floor(seconds / 60); // get total number of minutes passed
        seconds -= minutes * 60; // get total number of seconds within minute
        const secondsString = (seconds < 10) ? "0" + seconds: seconds + ""; // get string representation of seconds (add 0 in front if digits is single digit)
        const minutesString = (minutes < 10) ? "0" + minutes: minutes + ""; // get string representation of minutes (add 0 in front if digits is single digit)
        return `${minutesString}:${secondsString}`; // return time in minute & second format
    }
}