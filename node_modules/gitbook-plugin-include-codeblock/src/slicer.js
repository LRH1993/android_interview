// LICENSE : MIT
"use strict";
/*
 format: [import:<start-lineNumber>-<end-lineNumber>](path/to/file)
 lineNumber start with 1.

 Patterns:

 All: [import, hello-world.js](../src/hello-world.js)
 1-2: [import:1-2, hello-world.js](../src/hello-world.js)
 2-3: [import:2-3, hello-world.js](../src/hello-world.js)
 2>=: [import:2-, hello-world.js](../src/hello-world.js)
 <=3: [import:-3, hello-world.js](../src/hello-world.js)
 */
/**
 * get range from label
 * @param {string} label
 * @returns {number[]}
 */
export function getSliceRange(label) {
    const regExp = /^(?:include|import):(\d*)-(\d*)[,\s]?.*$/;
    const matches = regExp.exec(label);
    if (matches === null) {
        return [];
    }
    // return [undefined, undefined] if not matched, else contains [all,start,end].
    const [start, end] = matches.slice(1, 3);
    const startOrUndefined = start !== "" ? parseInt(start, 10) : undefined;
    const endOrUndefined = end !== "" ? parseInt(end, 10) : undefined;
    return [startOrUndefined, endOrUndefined];
}

/**
 * has range command in the label
 * @param {string} label
 * @returns {boolean}
 */
export function hasSliceRange(label) {
    const range = getSliceRange(label);
    const [start, end] = range;
    return start !== undefined || end !== undefined;
}

/**
 * slice {@link code} with {@link start} and {@link end}
 * @param {string} code
 * @param {number|undefined} [start]
 * @param {number|undefined} [end]
 * @param {boolean|undefined} [untrimmed]
 * @returns {string}
 */
export function sliceCode(code, start, end, untrimmed) {
    if (start === undefined && end === undefined) {
        return code;
    }
    const slitted = code.split("\n");
    if (start === undefined) {
        start = 1;
    }
    if (end === undefined) {
        end = slitted.length;
    }
    const sliced = slitted.slice(start - 1, end).join("\n");
    return untrimmed ? sliced : sliced.trim();
}
