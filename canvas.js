"use strict";

class Canvas {
    constructor(id) {
        this.id = id;
        this.HTMLElement = document.getElementById(id);
        this.handler = new Handler(this);
    }

    start() {
        setInterval(() => { this.mainloop(); }, 1000 / TPS);
    }

    mainloop() {
        this.HTMLElement.width = window.innerWidth;
        this.HTMLElement.height = window.innerHeight;
        this.handler.tick();
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