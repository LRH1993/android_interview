// LICENSE : MIT
/*
 * Feature: doxygen like snippet code.
 * For code source documenting, see
 * https://www.stack.nl/~dimitri/doxygen/manual/commands.html#cmdsnippet
 *
 * Gibook usage:
 *
 *      [import:<markername>](path/to/file)
 *
 * NB: markername must begin with a letter to avoid conflict with slice
 *     line range.
 */
"use strict";
const logger = require("winston-color");
const commentOpen = "(/+/+|#|%|/\\*|<!--)";
const commentClose = "(\\*/|-->)?";
const doxChar = "[*!/#]"; // doxygen documentation character
const spaces = "[ \t]*"; // h spaces
const spacesAny = "\\s*"; // h+v spaces
const markerNameFormat = "(\\s*[a-zA-Z][\\w\\s]*)"; // Must contain a char.

/*
 * format: [import:<markername>](path/to/file)
 * @param {Object} keyValObject
 * @return {string}
 */
export function getMarker(keyValObject) {
    return keyValObject.marker;
}

/**
 * format: [import:<markername>](path/to/file)
 * check if the import filled has a markername.
 * @example:
 *      hasMarker(label)
 * @param {Object} keyValObject
 * @returns {boolean}
 */
export function hasMarker(keyValObject) {
    const marker = getMarker(keyValObject);
    return marker !== undefined && marker !== "";
}

/* Parse the code from given markers
 *
 * see test/marker-test.js
 */
/**
 * get sliced code by {@link markername}
 * @param {string} code
 * @param {string} markers
 * @returns {string}
 */
export function markerSliceCode(code, markers) {
    if (markers === undefined || markers === "") {
        return code;
    }
    var parsedcode = "";
    const markerlist = markers.split(",");

    let i = 0;
    // regex
    markerlist.forEach(marker => {
        const balise = "\\[" + marker + "\\]";
        const pattern =
            "\\n" +
            spacesAny +
            commentOpen +
            doxChar +
            spaces +
            balise +
            spaces +
            commentClose +
            spaces;

        const regstr = pattern + "\\n*([\\s\\S]*)" + pattern;
        const reg = new RegExp(regstr);
        const res = code.match(reg);

        if (res) {
            parsedcode += res[3]; // count parenthesis in pattern.
        } else {
            logger.warn("markersSliceCode(): marker `" + marker + "` not found");
            parsedcode += "Error: marker `" + marker + "` not found";
        }
        if (markerlist.length > 0 && i < markerlist.length - 1) {
            parsedcode += "\n";
        }
        i++;
    });
    return parsedcode;
}

/** Replace all regex occurence by sub in the string str,
 * @param {string} str
 * @param {string} reg
 * @param {string} sub
 * @return {string}
 */
export function replaceAll(str, reg, sub) {
    return str.replace(new RegExp(reg, "g"), sub);
}

/** Function that remove all markers in the given code
 * @param {string} code
 * @return {string}
 */
export function removeMarkers(code) {
    // various language comment
    const tag = "\\[" + markerNameFormat + "\\]";
    const pattern =
        spacesAny + commentOpen + doxChar + spaces + tag + spaces + commentClose + spaces;

    return replaceAll(code, pattern, "");
}
