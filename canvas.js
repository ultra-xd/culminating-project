"use strict";

class Canvas {
    constructor(id) {
        this.id = id;
        this.HTMLElement = document.getElementById(id);
        this.keysPressed = [];
        this.attachKeybinds();
        this.handler = new Handler(this);
    }

    attachKeybinds() {
        document.addEventListener("keydown", (event) => {
            if (event.defaultPrevented) {
                return;
            }
            let key = event.key.toLowerCase();
            if (!arrayIncludes(this.keysPressed, key)) {
                arrayPush(this.keysPressed, key);
            }
            event.preventDefault();
        });

        document.addEventListener("keyup", (event) => {
            if (event.defaultPrevented) {
                return;
            }
            let key = event.key.toLowerCase();
            if (arrayIncludes(this.keysPressed, key)) {
                arrayDelete(this.keysPressed, arrayIndexOf(this.keysPressed, key));
            }
            event.preventDefault();
        });
    }

    start() {
        setInterval(() => { this.mainloop(); }, 1000 / TPS);
    }

    mainloop() {
        this.HTMLElement.width = window.innerWidth;
        this.HTMLElement.height = window.innerHeight;
        this.handler.tick(this.keysPressed);
        this.handler.draw();
    }

    getContext() {
        return this.HTMLElement.getContext("2d");
    }

    getWidth() {
        return this.HTMLElement.width;
    }
    getHeight() {
        return this.HTMLElement.height;
    }
}