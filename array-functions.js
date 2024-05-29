"use strict";

function arrayPush(array, element) {
    array[array.length] = element;
}

function arrayDelete(array, index) {
    if (index < 0 || index >= array.length) {
        return;
    }
    for (let i = index; i < array.length; i++) {
        array[i] = array[i + 1];
    }
    array.length -= 1;
}

function arrayIncludes(array, element) {
    for (let e of array) {
        if (e instanceof Vector2 && element instanceof Vector2) {
            if (e.equals(element)) {
                return true;
            }
        }
        else if (element == e) {
            return true;
        }
    }
    return false;
}

function arrayIndexOf(array, element) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == element) {
            return i;
        }
    }
    return undefined;
}

function arrayLastIndexOf(array, element) {
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] == element) {
            return i;
        }
    }
    return undefined;
}

let array = [1, 2, 1, 4, 5, 2, 9, 6, 4, 8, 6];
// arrayDelete(array, 3);
console.log(arrayIndexOf(array, 1));
console.log(arrayLastIndexOf(array, 1))