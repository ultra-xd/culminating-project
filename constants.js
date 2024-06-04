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

const imageLoader = {};
const imageFiles = [
    "files/assets/character/down/1down.png",
    "files/assets/character/down/2down.png",
    "files/assets/character/down/3down.png",
    "files/assets/character/down/4down.png",
    "files/assets/character/down/5down.png",
    "files/assets/character/down/6down.png",
    "files/assets/character/down/7down.png",
    "files/assets/character/down/8down.png",
    "files/assets/character/left/1left.png",
    "files/assets/character/left/2left.png",
    "files/assets/character/left/3left.png",
    "files/assets/character/left/4left.png",
    "files/assets/character/left/5left.png",
    "files/assets/character/left/6left.png",
    "files/assets/character/left/7left.png",
    "files/assets/character/left/8left.png",
    "files/assets/character/right/1right.png",
    "files/assets/character/right/2right.png",
    "files/assets/character/right/3right.png",
    "files/assets/character/right/4right.png",
    "files/assets/character/right/5right.png",
    "files/assets/character/right/6right.png",
    "files/assets/character/right/7right.png",
    "files/assets/character/right/8right.png",
    "files/assets/character/up/1up.png",
    "files/assets/character/up/2up.png",
    "files/assets/character/up/3up.png",
    "files/assets/character/up/4up.png",
    "files/assets/character/up/5up.png",
    "files/assets/character/up/6up.png",
    "files/assets/character/up/7up.png",
    "files/assets/character/up/8up.png"
];

function loadImages() {
    for (let file of imageFiles) {
        const image = new Image();
        image.src = file;
        imageLoader[file] = image;
    }
}
