"use strict";

// function to linearly interpolate between two values
function linearInterpolation(value1, value2, difference) {
    return value1 + difference * (value2 - value1); // use linear interpolation formula and return result
}

// function to generate random integer from min to max, inclusive
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min); // return random integer from min to max
}

// function to choose a random element from an array
function randomChoice(array) {
    return array[randomInteger(0, array.length - 1)]; // return the element at a randomly chosen index on the array
}
