"use strict";

let game; // declare game variable
let time; // store final time on arena
let verifiedUsername; // store username on aren
// main function called on load of website
function main() {
    // loadImages();
    // canvas = new Canvas("canvas"); // create new canvas
    // canvas.start(); // start the game loop for canvas
}

// function to start game
function startGame() {
    let username = document.getElementById("username-input").value; // get the username
    if (verifyUsername(username)) { // check if username is valid
        verifiedUsername = username; // set verified username to username
        game = new Game(); // create new game
        game.start(); // start game
        document.getElementById("canvas").hidden = false; // show canvas
        document.getElementById("menu").hidden = true; // hide start menu & death menu
        document.getElementById("death-menu").hidden = true;
    }
}

// function to end game
function endGame(time) {
    game.end(); // end the game
    document.getElementById("canvas").hidden = true; // hide canvas & start menu
    document.getElementById("menu").hidden = true;
    document.getElementById("death-menu").hidden = false; // show death menu
    document.getElementById("death-time").innerText = "Time: " + time; // update time
}

// function to return to main menu
function returnToMenu() {
    document.getElementById("canvas").hidden = true; // hide canvas
    document.getElementById("menu").hidden = false; // show start menu
    document.getElementById("death-menu").hidden = true; // hide death menu
}

// function to verify username
function verifyUsername(username) {
    /*
    to verify username:
    - username must be 5-20 characters
    - no special characters allowed (letters, numbers, underscore, period only)
    - no swear words (fork, shoot, dang)
    */
    let length = username.length; // get length of username
    if (length < 5 || length > 20) { // check if username is less than 5 characters or more than 20 characters
        alert("Username must by between 5 and 20 characters long"); // display alert to inform user of problem
        return false; // return negative result
    }
    // create an array of all lowercase characters allowed
    const allowedLowercaseLetters = [
        "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p",
        "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "_", ".",
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"
    ];
    // iterate through all letter of the username
    for (let i = 0; i < username.length; i++) {
        if (!arrayIncludes(allowedLowercaseLetters, username.charAt(i).toLowerCase())) { // check if the letter at the username is not in the array of allowed characters, capitalization ignored
            alert("Special characters are not allowed (only letters, numbers, underscore & period allowed)"); // display alert to inform user of problem
            return false; // return negative result
        }
    }
    const censoredWords = ["fork", "shoot", "dang"]; // create array of swear words
    for (let word of censoredWords) { // iterate through all swear words
        if (username.toLowerCase().replaceAll(word, "") != username.toLowerCase()) { // check if the swear word is in the username
            alert("Username must be appropriate"); // display alert to inform user of problem
            return false; // return negative result
        }
    }
    return true; // return positive result if all checks have been passed
}
