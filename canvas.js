"use strict";

// class for canvas where keys are registered and the canvas HTML element is updated and drawn
class Canvas {
    constructor(id) {
        this.id = id; // get the id of the canvas
        this.HTMLElement = document.getElementById(id); // get the HTML canvas based on id
        this.keysPressed = []; // create array to store all of the keys being pressed
        this.attachKeybinds(); // create event listeners for keybinds
        this.handler = new Handler(this); // create a new handler to handle all objects in the game
    }

    // method to attach keybinds to window
    attachKeybinds() {
        // create new event listener to track when a key is being pressed down
        document.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            let key = event.key.toLowerCase(); // get the key pressed to lowercase
            if (!arrayIncludes(this.keysPressed, key)) { // check if the key has not already been pressed(if you hold down a key, a key is processed multiple times without releasing)
                arrayPush(this.keysPressed, key); // add key to list of keys pressed
            }
            event.preventDefault(); // register that event is processed
        });

        // create new event listener to track when a key is being released
        document.addEventListener("keyup", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            let key = event.key.toLowerCase(); // get the key pressed to lowercase
            if (arrayIncludes(this.keysPressed, key)) {// check if the key has been pressed yet
                arrayDelete(this.keysPressed, arrayIndexOf(this.keysPressed, key)); // remove the key from the list of keys being pressed
            }
            event.preventDefault(); // register that event is processed
        });
    }

    // method to start a game loop
    start() {
        setInterval(() => { this.mainloop(); }, 1000 / TPS); // create an interval loop for every frame that runs the mainloop function every tick
    }

    // method to update the game every tick
    mainloop() {
        // update the width and height of the canvas to match the available space
        this.HTMLElement.width = window.innerWidth;
        this.HTMLElement.height = window.innerHeight;
        
        this.handler.tick(this.keysPressed); // update the game every tick
        this.handler.draw(); // draw the game display
    }

    // method to get the drawing context of the canvas
    getContext() {
        return this.HTMLElement.getContext("2d"); // return the drawing context of canvas
    }
    
    // method to get the width of the canvas
    getWidth() {
        return this.HTMLElement.width; // return width of canvas
    }

    // method to get the height of the canvas
    getHeight() {
        return this.HTMLElement.height; // return height of canvas
    }
}