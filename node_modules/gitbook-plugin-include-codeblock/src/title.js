// LICENSE : MIT
/*
 * Gibook usage:
 *
 *      [import,title:<the title>](path/to/file)
 */

/* Get the specified <the title>
 * @example:
 *     getTitle(keyValObject)
 * @param {Object} keyValObject
 * @return {string}
 */
export function getTitle(keyValObject) {
    return keyValObject.title;
}

/* Check if a title is specified in the option
 * @param {Object} keyValObject
 * @return {boolean}
 */
export function hasTitle(keyValObject) {
    const title = getTitle(keyValObject);
    return title !== undefined;
}
