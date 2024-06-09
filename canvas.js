"use strict";

// class for canvas where keys are registered and the canvas HTML element is updated and drawn
class Canvas {
    constructor(id) {
        this.id = id; // get the id of the canvas
        this.HTMLElement = document.getElementById(id); // get the HTML canvas based on id
        this.buttonsPressed = []; // create array to store all of the keys being pressed
        this.attachKeybinds(); // create event listeners for keybinds
        this.handler = new Handler(this); // create a new handler to handle all objects in the game
        this.mousePosition = undefined;
        this.loop;
    }

    // method to attach keybinds to window
    attachKeybinds() {
        document.body.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        // create new event listener to track when a key is being pressed down5
        document.body.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            let key = event.key.toLowerCase(); // get the key pressed to lowercase
            if (!arrayIncludes(this.buttonsPressed, key)) { // check if the key has not already been pressed(if you hold down a key, a key is processed multiple times without releasing)
                arrayPush(this.buttonsPressed, key); // add key to list of keys pressed
            }
            event.preventDefault(); // register that event is processed
        });

        // create new event listener to track when a key is being released
        document.body.addEventListener("keyup", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            let key = event.key.toLowerCase(); // get the key pressed to lowercase
            if (arrayIncludes(this.buttonsPressed, key)) {// check if the key has been pressed yet
                arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, key)); // remove the key from the list of keys being pressed
            }
            event.preventDefault(); // register that event is processed
        });
        // create new event listener to track when the mouse is being pressed
        document.body.addEventListener("mousedown", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            if (event.button == 0) {
                arrayPush(this.buttonsPressed, "LMB1");
            }
            else if (event.button == 2) {
                arrayPush(this.buttonsPressed, "RMB1");
            }
            event.preventDefault(); // register that event is processed
        });
        // create new event listener to track when the mouse is being released
        document.body.addEventListener("mouseup", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            if (event.button == 0) {
                arrayPush(this.buttonsPressed, "LMB2");
            }
            if (event.button == 2) {
                arrayPush(this.buttonsPressed, "RMB2");
            }
            event.preventDefault(); // register that event is processed
        });

        document.body.addEventListener("mousemove", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }

            let rectangle = this.HTMLElement.getBoundingClientRect();
            this.mousePosition = new Vector2(event.clientX - rectangle.left, event.clientY - rectangle.top);

            event.preventDefault(); // register that event is processed
        });
    }

    detachKeybinds() {
        document.body.replaceWith(document.body.cloneNode(true));
    }

    // method to start a game loop
    start() {
        this.loop = setInterval(() => { this.mainloop(); }, 1000 / TPS); // create an interval loop for every frame that runs the mainloop function every tick
    }

    end() {
        clearInterval(this.loop);
        this.detachKeybinds();
    }

    // method to update the game every tick
    mainloop() {
        // update the width and height of the canvas to match the available space
        this.HTMLElement.width = window.innerWidth;
        this.HTMLElement.height = window.innerHeight;
        this.handler.tick(this.buttonsPressed); // update the game every tick
        if (arrayIncludes(this.buttonsPressed, "LMB1")) {
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "LMB1"));
        }
        if (arrayIncludes(this.buttonsPressed, "RMB1")) {
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "RMB1"));
        }
        if (arrayIncludes(this.buttonsPressed, "LMB2")) {
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "LMB2"));
        }
        if (arrayIncludes(this.buttonsPressed, "RMB2")) {
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "RMB2"));
        }

        // let boundingRectangle = this.HTMLElement.getBoundingClientRect();
        // const mouseX = event

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

    // method to get mouse position relative to canvas
    getMousePosition() {
        return this.mousePosition;
    }
}