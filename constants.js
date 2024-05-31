"use strict";

const TPS = 60; // set the ticks per second to 60
const VERTICAL = 0;
const HORIZONTAL = 1;
const DIAGONAL = 2;

// create dictionary for all arenas
const ARENAS = {
    1: [ // store array of walls
        new Vector2(2, 2),
        new Vector2(2, 3),
        new Vector2(2, 4),
        new Vector2(2, 6),
        new Vector2(2, 7),
        new Vector2(3, 2),
        new Vector2(4, 2),
        new Vector2(6, 2),
        new Vector2(7, 2),
        new Vector2(8, 2),
        new Vector2(9, 2),
        new Vector2(10, 2),
        new Vector2(11, 2),
        new Vector2(12, 2)
    ]
};