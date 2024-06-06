"use strict";

const TPS = 60; // set the ticks per second to 60
const VERTICAL = 0;
const HORIZONTAL = 1;
const DIAGONAL = 2;

// create dictionary for all arenas
const ARENAS = {
    1: [ // store array of wall coordinates
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

const IMAGE_LOADER = {}; // create object with file names attached to their image objects
const imageFiles = [ // store image file links
    "files/assets/character/down/1down.png",
    "files/assets/character/down/2down.png",
    "files/assets/character/down/3down.png",
    "files/assets/character/down/4down.png",
    "files/assets/character/down/5down.png",
    "files/assets/character/down/6down.png",
    "files/assets/character/down/7down.png",
    "files/assets/character/down/8down.png",
    "files/assets/character/down/1downattack.png",
    "files/assets/character/down/2downattack.png",
    "files/assets/character/down/3downattack.png",
    "files/assets/character/down/4downattack.png",
    "files/assets/character/down/5downattack.png",
    "files/assets/character/down/6downattack.png",
    "files/assets/character/down/7downattack.png",
    "files/assets/character/down/8downattack.png",
    "files/assets/character/left/1left.png",
    "files/assets/character/left/2left.png",
    "files/assets/character/left/3left.png",
    "files/assets/character/left/4left.png",
    "files/assets/character/left/5left.png",
    "files/assets/character/left/6left.png",
    "files/assets/character/left/7left.png",
    "files/assets/character/left/8left.png",
    "files/assets/character/left/1leftattack.png",
    "files/assets/character/left/2leftattack.png",
    "files/assets/character/left/3leftattack.png",
    "files/assets/character/left/4leftattack.png",
    "files/assets/character/left/5leftattack.png",
    "files/assets/character/left/6leftattack.png",
    "files/assets/character/left/7leftattack.png",
    "files/assets/character/left/8leftattack.png",
    "files/assets/character/right/1right.png",
    "files/assets/character/right/2right.png",
    "files/assets/character/right/3right.png",
    "files/assets/character/right/4right.png",
    "files/assets/character/right/5right.png",
    "files/assets/character/right/6right.png",
    "files/assets/character/right/7right.png",
    "files/assets/character/right/8right.png",
    "files/assets/character/right/1rightattack.png",
    "files/assets/character/right/2rightattack.png",
    "files/assets/character/right/3rightattack.png",
    "files/assets/character/right/4rightattack.png",
    "files/assets/character/right/5rightattack.png",
    "files/assets/character/right/6rightattack.png",
    "files/assets/character/right/7rightattack.png",
    "files/assets/character/right/8rightattack.png",
    "files/assets/character/up/1up.png",
    "files/assets/character/up/2up.png",
    "files/assets/character/up/3up.png",
    "files/assets/character/up/4up.png",
    "files/assets/character/up/5up.png",
    "files/assets/character/up/6up.png",
    "files/assets/character/up/7up.png",
    "files/assets/character/up/8up.png",
    "files/assets/character/up/1upattack.png",
    "files/assets/character/up/2upattack.png",
    "files/assets/character/up/3upattack.png",
    "files/assets/character/up/4upattack.png",
    "files/assets/character/up/5upattack.png",
    "files/assets/character/up/6upattack.png",
    "files/assets/character/up/7upattack.png",
    "files/assets/character/up/8upattack.png"
];

// function to load images into object storing images
function loadImages() {
    for (let file of imageFiles) { // iterate through all files in the array
        const image = new Image(); // create new image object
        image.src = file; // change source of image to file
        IMAGE_LOADER[file] = image; // add image to object with the key being the file name
    }
}
