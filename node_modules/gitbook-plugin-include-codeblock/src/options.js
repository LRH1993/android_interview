// LICENSE : MIT
// Notes:
// 1) If you add new options type, you have to update type checks in parser.js
// (see parseVariableFromMap).
// 2) The default map (objects) are immutable (frozen). They are updated (new map
// with different names) while parsing book.json options first, then eventually
// overwriten by commands options.
"use strict";
const logger = require("winston-color");
const path = require("path");
const cfg = require("../package.json").gitbook.properties;

export const defaultTemplateMap = Object.freeze({
    default: path.join(__dirname, "..", "templates", "default-template.hbs"),
    full: path.join(__dirname, "..", "templates", "full-template.hbs"),
    ace: path.join(__dirname, "..", "templates", "ace-template.hbs"),
    acefull: path.join(__dirname, "..", "templates", "acefull-template.hbs")
});

// Map for Book.json options. (avoid `undefined` for ace options),
// NB: Default book option, type, desc are set in the package.json file.
export const defaultBookOptionsMap = Object.freeze({
    check: cfg.check.default,
    edit: cfg.edit.default,
    lang: cfg.lang.default,
    fixlang: cfg.fixlang.default,
    template: cfg.template.default,
    theme: cfg.theme.default,
    unindent: cfg.unindent.default
});

// Possible command key-values (kv).
// (avoid undefined default value because we check value types).
export const defaultKeyValueMap = Object.freeze({
    // Local
    class: "",
    id: "",
    marker: "",
    name: "",
    title: "",
    // Global/Local
    check: defaultBookOptionsMap.check,
    edit: defaultBookOptionsMap.edit,
    lang: defaultBookOptionsMap.lang,
    fixlang: defaultBookOptionsMap.fixlang,
    template: defaultBookOptionsMap.template,
    theme: defaultBookOptionsMap.theme,
    unindent: defaultBookOptionsMap.unindent
});

/**
 * Convert string value to value type.
 * @param {string} valtype
 */
export function convertValue(valstr, valtype) {
    // remove quotes
    if (valtype === "boolean" || valtype === "number") {
        return JSON.parse(valstr);
    }
    return valstr;
}

/**
 * Check that maps types equal to default key value map.
 * @param {object} kvMap
 * @param {string} funcLabel
 */
export function checkMapTypes(kvMap, funcLabel) {
    Object.keys(kvMap).forEach(key => {
        if (defaultKeyValueMap[key] !== undefined) {
            const leftType = typeof kvMap[key];
            const rightType = typeof defaultKeyValueMap[key];
            if (!(leftType === rightType)) {
                logger.error(
                    `include-codeblock: checkMapTypes (${funcLabel}) : wrong value type for key \`${key}\`: key type: \`${leftType}\` (!= \`${rightType}\`)`
                );
            }
        }
    });
}

/**
 * Check that maps types equal to default key value map.
 * @param {{template?: string}} options
 * @return {object} kvMap
 */
export function initOptions(options) {
    const dbom = defaultBookOptionsMap;
    const kv = Object.assign({}, defaultKeyValueMap);
    // Overwrite default value with user book options.
    Object.keys(dbom).forEach(key => {
        if (options[key] != undefined) {
            kv[key] = convertValue(options[key], typeof dbom[key]);
        }
    });
    const kvmap = Object.freeze(kv);
    checkMapTypes(kvmap, "initOptions");
    return kvmap;
}
