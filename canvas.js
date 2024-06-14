"use strict";

// class for canvas where keys are registered and the canvas HTML element is updated and drawn
class Canvas {
    constructor(id) {
        this.id = id; // get the id of the canvas
        this.HTMLElement = document.getElementById(id); // get the HTML canvas based on id
        this.buttonsPressed = []; // create array to store all of the keys being pressed
        this.attachKeybinds(); // create event listeners for keybinds
        this.handler = new Handler(this); // create a new handler to handle all objects in the game
        this.mousePosition = undefined; // store mouse position
        this.loop; // store interval loop variable
    }

    // method to attach keybinds to window
    attachKeybinds() {
        // create new event listener to prevent right-click menu from appearing when right-click attacking
        document.body.addEventListener("contextmenu", (event) => {
            event.preventDefault(); // prevent event from processing further
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
                arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, key)); // remove the key from the list of buttons being pressed
            }
            event.preventDefault(); // register that event is processed
        });
        // create new event listener to track when the mouse is being pressed: in the array, a press is tracked with a "1" at the end of the keycode
        document.body.addEventListener("mousedown", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            if (event.button == 0) { // check if left mouse button has been pressed
                arrayPush(this.buttonsPressed, "LMB1"); // add left mouse button key to list of button events
            }
            else if (event.button == 2) { // check if right mouse button has been pressed
                arrayPush(this.buttonsPressed, "RMB1"); // add right mouse button key to list of button events
            }
            event.preventDefault(); // register that event is processed
        });
        // create new event listener to track when the mouse is being released: in the array, a release is tracked with a "2" at the end of the key cpde
        document.body.addEventListener("mouseup", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }
            if (event.button == 0) { // check if left mouse button has been released
                arrayPush(this.buttonsPressed, "LMB2"); // add left mouse button key to list of button events
            }
            if (event.button == 2) { // check if right mouse button has been released
                arrayPush(this.buttonsPressed, "RMB2"); // add right mouse button key to list of button events
            }
            event.preventDefault(); // register that event is processed
        });
        // button to track if the mouse is moved to get the mouse position
        document.body.addEventListener("mousemove", (event) => {
            if (event.defaultPrevented) { // check if event has already been processed
                return; // exit if event has already been processed
            }

            let rectangle = this.HTMLElement.getBoundingClientRect(); // get the position of the rectangle that represents the canvas
            this.mousePosition = new Vector2(event.clientX - rectangle.left, event.clientY - rectangle.top); // get the mouse position relative to that of the canvas and store in a variable

            event.preventDefault(); // register that event is processed
        });
    }

    // button to detach all key binds by removing all event listeners
    detachKeybinds() {
        document.body.replaceWith(document.body.cloneNode(true)); // replace all elements with themselves, with exception of event listeners
    }

    // method to start a game loop
    start() {
        this.loop = setInterval(() => { this.mainloop(); }, 1000 / TPS); // create an interval loop for every frame that runs the mainloop function every tick
    }

    // method to end game loop
    end() {
        clearInterval(this.loop); // clear the interval loop running mainloop function
        this.detachKeybinds(); // detach all keybinds
    }

    // method to update the game every tick
    mainloop() {
        // update the width and height of the canvas to match the available space
        this.HTMLElement.width = window.innerWidth;
        this.HTMLElement.height = window.innerHeight;
        this.handler.tick(this.buttonsPressed); // update the game every tick
        // remove left & right mouse button events so that they are only processed once
        if (arrayIncludes(this.buttonsPressed, "LMB1")) { // check if there is a left mouse button press event
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "LMB1")); // remove left mouse button press event
        }
        if (arrayIncludes(this.buttonsPressed, "RMB1")) { // check if there is a right mouse button press event
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "RMB1")); // remove right mouse button press event
        }
        if (arrayIncludes(this.buttonsPressed, "LMB2")) { // check if there is a left mouse button release event
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "LMB2")); // remove left mouse button release event
        }
        if (arrayIncludes(this.buttonsPressed, "RMB2")) { // check if there is a right mouse button release event
            arrayDelete(this.buttonsPressed, arrayIndexOf(this.buttonsPressed, "RMB2")); // remove right mouse button release event
        }
        this.handler.draw(); // draw the game display
    }

    // method to get the drawing context of the canvas
    getContext() {
        return this.HTMLElement.getContext("2d"); // return the drawing context of canvas
    }
    
    // method to get the width of the canvas in pixels
    getWidth() {
        return this.HTMLElement.width; // return width of canvas
    }

    // method to get the height of the canvas in pixels
    getHeight() {
        return this.HTMLElement.height; // return height of canvas
    }

    // method to get mouse position relative to canvas in pixels
    getMousePosition() {
        return this.mousePosition; // return mouse position
    }
}