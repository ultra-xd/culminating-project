"use strict";

// class for timer
class Timer {
    constructor(arena) {
        this.arena = arena; // store the arena
        this.ticks = 0; // store number of ticks
    }
    tick() {
        if (this.arena.getPlayer().getIfAlive()) {
            this.ticks++;
        }
    }
    draw(context) {
        const pixelCoords = this.arena.coordsToPixels(new Vector2(0, 0)); // get the position of the player on the screen
        const unitLength = this.arena.getUnitLength(); // get how large 1 tile is on the display to properly size the player
        const textSize = unitLength / 4;
        context.fillStyle = "white";
        context.fontStyle = `${textSize}px Consolas`;

        const stringDisplay = this.getString();

        const padding = unitLength / 4;
        context.fillText(stringDisplay, pixelCoords.getX() + padding, pixelCoords.getY() - padding);
    }
    getString() {
        let seconds = Math.floor(this.ticks / TPS);
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        const secondsString = (seconds < 10) ? "0" + seconds: seconds + "";
        const minutesString = (minutes < 10) ? "0" + minutes: minutes + "";
        return `${minutesString}:${secondsString}`;
    }
}