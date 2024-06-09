class Game {
    constructor() {
        this.canvas = new Canvas("canvas");
    }

    start() {
        this.canvas.start();
    }

    end() {
        this.canvas.end();
    }

    getCanvas() {
        return this.canvas;
    }
}