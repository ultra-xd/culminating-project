"use strict";

// function to linearly interpolate between two values
function linearInterpolation(value1, value2, difference) {
    return value1 + difference * (value2 - value1); // use linear interpolation formula and return result
}