"use strict";

// function to linearly interpolate between two values
function linearInterpolation(value1, value2, difference) {
    return value1 + difference * (value2 - value1); // use linear interpolation formula and return result
}

function randomInteger(min, max) { // generates random number from min to max, inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}
