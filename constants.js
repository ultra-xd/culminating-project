"use strict";

const TPS = 60; // set the ticks per second to 60
// constants to differentiate vertical, horizontal & diagonal collisions in collision system
const VERTICAL = 0;
const HORIZONTAL = 1;
const DIAGONAL = 2;

// create dictionary for all arenas
// first dimension stores the arena type/id, second dimension stores information (wall positions, tower positions, enemy spawner & enemy positions & player position)
const ARENAS = {
    1: {
        "walls": [ // store array of wall coordinates
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
            new Vector2(12, 2),
            new Vector2(12, 2),
            new Vector2(12, 3),
            new Vector2(12, 5),
            new Vector2(12, 6),
            new Vector2(12, 7),
            new Vector2(-1, 0),
            new Vector2(-1, 1),
            new Vector2(-1, 2),
            new Vector2(-1, 3),
            new Vector2(-1, 4),
            new Vector2(-1, 5),
            new Vector2(-1, 6),
            new Vector2(-1, 7),
            new Vector2(-1, 8),
            new Vector2(-1, 9),
            new Vector2(15, 0),
            new Vector2(15, 1),
            new Vector2(15, 2),
            new Vector2(15, 3),
            new Vector2(15, 4),
            new Vector2(15, 5),
            new Vector2(15, 6),
            new Vector2(15, 7),
            new Vector2(15, 8),
            new Vector2(15, 9),
            new Vector2(0, -1),
            new Vector2(1, -1),
            new Vector2(2, -1),
            new Vector2(3, -1),
            new Vector2(4, -1),
            new Vector2(5, -1),
            new Vector2(6, -1),
            new Vector2(7, -1),
            new Vector2(8, -1),
            new Vector2(9, -1),
            new Vector2(10, -1),
            new Vector2(11, -1),
            new Vector2(12, -1),
            new Vector2(13, -1),
            new Vector2(14, -1),
            new Vector2(0, 10),
            new Vector2(1, 10),
            new Vector2(2, 10),
            new Vector2(3, 10),
            new Vector2(4, 10),
            new Vector2(5, 10),
            new Vector2(6, 10),
            new Vector2(7, 10),
            new Vector2(8, 10),
            new Vector2(9, 10),
            new Vector2(10, 10),
            new Vector2(11, 10),
            new Vector2(12, 10),
            new Vector2(13, 10),
            new Vector2(14, 10)
        ],
        "towers": [ // store array of tower coordinates
            new Vector2(1, 7),
            new Vector2(13, 7)
        ],
        "enemySpawners": [ // store array of enemy spawner coordinates
            new Vector2(6, 4),
            new Vector2(7, 5)
        ],
        "spawnedEnemies": [ // store array of enemy coordinates
            new Vector2(7, 7)
        ],
        "playerStartPosition": new Vector2(1, 1) // store player spawn position
    },
    2: {
        "walls": [ // store array of wall coordinates
            new Vector2(8, 0),
            new Vector2(9, 0),
            new Vector2(10, 0),
            new Vector2(11, 0),
            new Vector2(12, 0),
            new Vector2(14, 0),

            new Vector2(0, 1),
            new Vector2(1, 1),
            new Vector2(2, 1),
            new Vector2(3, 1),
            new Vector2(4, 1),
            new Vector2(6, 1),
            new Vector2(12, 1),
            new Vector2(14, 1),

            new Vector2(4, 2),
            new Vector2(6, 2),
            new Vector2(7, 2),
            new Vector2(8, 2),
            new Vector2(9, 2),
            new Vector2(10, 2),
            new Vector2(12, 2),
            new Vector2(14, 2),

            new Vector2(1, 3),
            new Vector2(2, 3),
            new Vector2(3, 3),
            new Vector2(4, 3),
            new Vector2(6, 3),
            new Vector2(12, 3),
            new Vector2(14, 3),

            new Vector2(6, 4),
            new Vector2(7, 4),
            new Vector2(8, 4),
            new Vector2(9, 4),
            new Vector2(10, 4),
            new Vector2(11, 4),
            new Vector2(12, 4),
            new Vector2(14, 4),

            new Vector2(0, 5),
            new Vector2(2, 5),
            new Vector2(3, 5),
            new Vector2(4, 5),
            new Vector2(9, 5),

            new Vector2(0, 6),
            new Vector2(2, 6),
            new Vector2(4, 6),
            new Vector2(5, 6),
            new Vector2(7, 6),
            new Vector2(9, 6),
            new Vector2(10, 6),
            new Vector2(11, 6),
            new Vector2(12, 6),
            new Vector2(13, 6),

            new Vector2(5, 7),
            new Vector2(7, 7),
            new Vector2(13, 7),

            new Vector2(0, 8),
            new Vector2(2, 8),
            new Vector2(3, 8),
            new Vector2(4, 8),
            new Vector2(5, 8),
            new Vector2(7, 8),
            new Vector2(9, 8),
            new Vector2(10, 8),
            new Vector2(11, 8),
            new Vector2(12, 8),
            new Vector2(13, 8),

            new Vector2(0, 9),
            new Vector2(7, 9),
            new Vector2(-1, 0),
            new Vector2(-1, 1),
            new Vector2(-1, 2),
            new Vector2(-1, 3),
            new Vector2(-1, 4),
            new Vector2(-1, 5),
            new Vector2(-1, 6),
            new Vector2(-1, 7),
            new Vector2(-1, 8),
            new Vector2(-1, 9),
            new Vector2(15, 0),
            new Vector2(15, 1),
            new Vector2(15, 2),
            new Vector2(15, 3),
            new Vector2(15, 4),
            new Vector2(15, 5),
            new Vector2(15, 6),
            new Vector2(15, 7),
            new Vector2(15, 8),
            new Vector2(15, 9),
            new Vector2(0, -1),
            new Vector2(1, -1),
            new Vector2(2, -1),
            new Vector2(3, -1),
            new Vector2(4, -1),
            new Vector2(5, -1),
            new Vector2(6, -1),
            new Vector2(7, -1),
            new Vector2(8, -1),
            new Vector2(9, -1),
            new Vector2(10, -1),
            new Vector2(11, -1),
            new Vector2(12, -1),
            new Vector2(13, -1),
            new Vector2(14, -1),
            new Vector2(0, 10),
            new Vector2(1, 10),
            new Vector2(2, 10),
            new Vector2(3, 10),
            new Vector2(4, 10),
            new Vector2(5, 10),
            new Vector2(6, 10),
            new Vector2(7, 10),
            new Vector2(8, 10),
            new Vector2(9, 10),
            new Vector2(10, 10),
            new Vector2(11, 10),
            new Vector2(12, 10),
            new Vector2(13, 10),
            new Vector2(14, 10)
        ],
        "towers": [ // store array of tower coordinates
            new Vector2(7, 3)
        ],
        "enemySpawners": [ // store array of enemy spawner coordinates
            new Vector2(12, 7),
            new Vector2(3, 6)
        ],
        "spawnedEnemies": [ // store array of enemy coordinates
            new Vector2(3.5, 2.5)
        ],
        "playerStartPosition": new Vector2(0.5, 0.5) // store player spawn position
    },
    3: {
        "walls": [// store array of wall coordinates
            new Vector2(5, 1),
            new Vector2(6, 1),
            new Vector2(7, 1),
            new Vector2(8, 1),
            new Vector2(9, 1),

            new Vector2(2, 3),
            new Vector2(5, 3),
            new Vector2(6, 3),
            new Vector2(7, 3),
            new Vector2(8, 3),
            new Vector2(9, 3),
            new Vector2(12, 3),

            new Vector2(2, 4),
            new Vector2(5, 4),
            new Vector2(12, 4),

            new Vector2(2, 5),
            new Vector2(5, 5),
            new Vector2(12, 5),

            new Vector2(2, 6),
            new Vector2(5, 6),
            new Vector2(6, 6),
            new Vector2(7, 6),
            new Vector2(8, 6),
            new Vector2(9, 6),
            new Vector2(12, 6),

            new Vector2(5, 8),
            new Vector2(6, 8),
            new Vector2(7, 8),
            new Vector2(8, 8),
            new Vector2(9, 8),

            new Vector2(-1, 0),
            new Vector2(-1, 1),
            new Vector2(-1, 2),
            new Vector2(-1, 3),
            new Vector2(-1, 4),
            new Vector2(-1, 5),
            new Vector2(-1, 6),
            new Vector2(-1, 7),
            new Vector2(-1, 8),
            new Vector2(-1, 9),
            new Vector2(15, 0),
            new Vector2(15, 1),
            new Vector2(15, 2),
            new Vector2(15, 3),
            new Vector2(15, 4),
            new Vector2(15, 5),
            new Vector2(15, 6),
            new Vector2(15, 7),
            new Vector2(15, 8),
            new Vector2(15, 9),
            new Vector2(0, -1),
            new Vector2(1, -1),
            new Vector2(2, -1),
            new Vector2(3, -1),
            new Vector2(4, -1),
            new Vector2(5, -1),
            new Vector2(6, -1),
            new Vector2(7, -1),
            new Vector2(8, -1),
            new Vector2(9, -1),
            new Vector2(10, -1),
            new Vector2(11, -1),
            new Vector2(12, -1),
            new Vector2(13, -1),
            new Vector2(14, -1),
            new Vector2(0, 10),
            new Vector2(1, 10),
            new Vector2(2, 10),
            new Vector2(3, 10),
            new Vector2(4, 10),
            new Vector2(5, 10),
            new Vector2(6, 10),
            new Vector2(7, 10),
            new Vector2(8, 10),
            new Vector2(9, 10),
            new Vector2(10, 10),
            new Vector2(11, 10),
            new Vector2(12, 10),
            new Vector2(13, 10),
            new Vector2(14, 10)
        ],
        "towers": [ // store array of wall coordinates
            new Vector2(0, 4),
            new Vector2(14, 4)
        ],
        "enemySpawners": [ // store array of enemy spawner coordinates
            new Vector2(6, 4),
            new Vector2(6, 5),
        ],
        "spawnedEnemies": [ // store array of enemy coordinates
            new Vector2(11, 5)
        ],
        "playerStartPosition": new Vector2(0.5, 0.5) // store player spawn position
    }
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
    "files/assets/character/up/8upattack.png",
    "files/assets/character/sweeping/1sweepingattack.png",
    "files/assets/character/sweeping/2sweepingattack.png",
    "files/assets/character/sweeping/3sweepingattack.png",
    "files/assets/character/sweeping/4sweepingattack.png",
    "files/assets/character/sweeping/5sweepingattack.png",
    "files/assets/character/sweeping/6sweepingattack.png",
    "files/assets/character/sweeping/7sweepingattack.png",
    "files/assets/character/sweeping/8sweepingattack.png",
    "files/assets/textures/non-animated/arrow.png",
    "files/assets/textures/non-animated/background.png",
    "files/assets/textures/non-animated/fireball.png",
    "files/assets/textures/non-animated/grass.png",
    "files/assets/textures/non-animated/stone.png",
    "files/assets/textures/non-animated/tower.png",
    "files/assets/textures/animated/spawn-pod/1spawnpod.png",
    "files/assets/textures/animated/spawn-pod/2spawnpod.png",
    "files/assets/textures/animated/spawn-pod/3spawnpod.png",
    "files/assets/textures/animated/spawn-pod/4spawnpod.png",
    "files/assets/textures/animated/spawn-pod/5spawnpod.png",
    "files/assets/textures/animated/spawn-pod/6spawnpod.png",
    "files/assets/enemies/zombie/down/1down.png",
    "files/assets/enemies/zombie/down/2down.png",
    "files/assets/enemies/zombie/down/3down.png",
    "files/assets/enemies/zombie/down/4down.png",
    "files/assets/enemies/zombie/down/5down.png",
    "files/assets/enemies/zombie/down/6down.png",
    "files/assets/enemies/zombie/down/7down.png",
    "files/assets/enemies/zombie/down/8down.png",
    "files/assets/enemies/zombie/left/1left.png",
    "files/assets/enemies/zombie/left/2left.png",
    "files/assets/enemies/zombie/left/3left.png",
    "files/assets/enemies/zombie/left/4left.png",
    "files/assets/enemies/zombie/left/5left.png",
    "files/assets/enemies/zombie/left/6left.png",
    "files/assets/enemies/zombie/left/7left.png",
    "files/assets/enemies/zombie/left/8left.png",
    "files/assets/enemies/zombie/right/1right.png",
    "files/assets/enemies/zombie/right/2right.png",
    "files/assets/enemies/zombie/right/3right.png",
    "files/assets/enemies/zombie/right/4right.png",
    "files/assets/enemies/zombie/right/5right.png",
    "files/assets/enemies/zombie/right/6right.png",
    "files/assets/enemies/zombie/right/7right.png",
    "files/assets/enemies/zombie/right/8right.png",
    "files/assets/enemies/zombie/up/1up.png",
    "files/assets/enemies/zombie/up/2up.png",
    "files/assets/enemies/zombie/up/3up.png",
    "files/assets/enemies/zombie/up/4up.png",
    "files/assets/enemies/zombie/up/5up.png",
    "files/assets/enemies/zombie/up/6up.png",
    "files/assets/enemies/zombie/up/7up.png",
    "files/assets/enemies/zombie/up/8up.png",
    "files/assets/enemies/skeleton/down/1down.png",
    "files/assets/enemies/skeleton/down/2down.png",
    "files/assets/enemies/skeleton/down/3down.png",
    "files/assets/enemies/skeleton/down/4down.png",
    "files/assets/enemies/skeleton/down/5down.png",
    "files/assets/enemies/skeleton/down/6down.png",
    "files/assets/enemies/skeleton/down/7down.png",
    "files/assets/enemies/skeleton/down/8down.png",
    "files/assets/enemies/skeleton/left/1left.png",
    "files/assets/enemies/skeleton/left/2left.png",
    "files/assets/enemies/skeleton/left/3left.png",
    "files/assets/enemies/skeleton/left/4left.png",
    "files/assets/enemies/skeleton/left/5left.png",
    "files/assets/enemies/skeleton/left/6left.png",
    "files/assets/enemies/skeleton/left/7left.png",
    "files/assets/enemies/skeleton/left/8left.png",
    "files/assets/enemies/skeleton/right/1right.png",
    "files/assets/enemies/skeleton/right/2right.png",
    "files/assets/enemies/skeleton/right/3right.png",
    "files/assets/enemies/skeleton/right/4right.png",
    "files/assets/enemies/skeleton/right/5right.png",
    "files/assets/enemies/skeleton/right/6right.png",
    "files/assets/enemies/skeleton/right/7right.png",
    "files/assets/enemies/skeleton/right/8right.png",
    "files/assets/enemies/skeleton/up/1up.png",
    "files/assets/enemies/skeleton/up/2up.png",
    "files/assets/enemies/skeleton/up/3up.png",
    "files/assets/enemies/skeleton/up/4up.png",
    "files/assets/enemies/skeleton/up/5up.png",
    "files/assets/enemies/skeleton/up/6up.png",
    "files/assets/enemies/skeleton/up/7up.png",
    "files/assets/enemies/skeleton/up/8up.png",
    "files/assets/enemies/skeleton/down/1shootingdown.png",
    "files/assets/enemies/skeleton/down/2shootingdown.png",
    "files/assets/enemies/skeleton/down/3shootingdown.png",
    "files/assets/enemies/skeleton/left/1shootingleft.png",
    "files/assets/enemies/skeleton/left/2shootingleft.png",
    "files/assets/enemies/skeleton/left/3shootingleft.png",
    "files/assets/enemies/skeleton/right/1shootingright.png",
    "files/assets/enemies/skeleton/right/2shootingright.png",
    "files/assets/enemies/skeleton/right/3shootingright.png",
    "files/assets/enemies/skeleton/up/1shootingup.png",
    "files/assets/enemies/skeleton/up/2shootingup.png",
    "files/assets/enemies/skeleton/up/3shootingup.png"
];


for (let file of imageFiles) { // iterate through all files in the array
    const image = new Image(); // create new image object
    image.src = file; // change source of image to file
    IMAGE_LOADER[file] = image; // add image to object with the key being the file name
}

