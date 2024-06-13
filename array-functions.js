"use strict";

// javascript file to store custom-made array methods

// function to add an element to the end of an array: requires array and element to be added
function arrayPush(array, element) {
    array[array.length] = element; // add element to the end of the array
}

// function to delete an array element: requires array and index of element to be deleted
function arrayDelete(array, index) {
    // check if index is out of bounds of array
    if (index < 0 || index >= array.length) {
        return; // exit function if out of bounds
    }
    // iterate through all elements at the index and after the index
    for (let i = index; i < array.length; i++) {
        array[i] = array[i + 1]; // replace the element with the element after
    }
    array.length -= 1; // reduce length of array by 1 to delete last element
}

// function to check if an element is an an array: requires array and element to be checked
function arrayIncludes(array, element) {
    for (let e of array) { // iterate through all elements
        // check if both elements belong to the vector 2 class
        if (e instanceof Vector2 && element instanceof Vector2) {
            if (e.equals(element)) { // check if x & y components of vectors are equal
                return true; // return positive result
            }
        }
        else if (element == e) { // check if an element is equal to another
            return true; // return positive result
        }
    }
    return false; // return negative result if no positive result is returned
}

// function to find the first index of an element in an array: requires array and element to be found
function arrayIndexOf(array, element) {
    // iterate through all elements of array
    for (let i = 0; i < array.length; i++) {
        if (array[i] == element) { // check if the elements are equal 
            return i; // return the index of the element
        }
    }
    return undefined; // return undefined if element is not in the array
}

// function to find the last index of an element in an array: requires array and element to be found
function arrayLastIndexOf(array, element) {
    // iterate through all elements of array in reverse order
    for (let i = array.length - 1; i >= 0; i--) {
        if (array[i] == element) { // check if the elements are equal
            return i; // return the index of the element
        }
    }
    return undefined; // return undefined if element is not in the array
}

function arrayCombine() {
    let newArray = [];
    let args = arguments;
    for (let array of args) {
        for (let element of array) {
            arrayPush(newArray, element);
        }
    }
    return newArray;
}
