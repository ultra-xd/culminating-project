"use strict";

let game;

// main function called on load of website
function main() {
    loadImages();
    // canvas = new Canvas("canvas"); // create new canvas
    // canvas.start(); // start the game loop for canvas
}

function startGame() {
    let username = document.getElementById("username-input").value;
    if (verifyUsername(username)) {
        game = new Game();
        game.start();
        document.getElementById("canvas").hidden = false;
        document.getElementById("menu").hidden = true;
        document.getElementById("death-menu").hidden = true;
    }
}

function endGame() {
    game.end();
    document.getElementById("canvas").hidden = true;
    document.getElementById("menu").hidden = true;
    document.getElementById("death-menu").hidden = false;
}

function returnToMenu() {
    document.getElementById("canvas").hidden = true;
    document.getElementById("menu").hidden = false;
    document.getElementById("death-menu").hidden = true;
}

function verifyUsername(username) {
    let length = username.length;
    if (length < 5 || length > 20) {
        alert("Username must by between 5 and 20 characters long");
        return false;
    }
    const allowedLowercaseLetters = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
        "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "_", ".",
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
    ];
    for (let i = 0; i < username.length; i++) {
        if (!arrayIncludes(allowedLowercaseLetters, username.charAt(i).toLowerCase())) {
            alert("Special characters are not allowed (only letters, numbers, underscore & period allowed)");
            return false;
        }
    }
    const censoredWords = ["fork", "shoot", "dang"];
    for (let word of censoredWords) {
        if (username.toLowerCase().replaceAll(word, "") != username.toLowerCase()) {
            alert("Username must be appropriate");
            return false;
        }
    }
    return true;
}