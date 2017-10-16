// LICENSE : MIT
"use strict";
const fs = require("fs");
const logger = require("winston-color");
import { defaultBookOptionsMap, defaultTemplateMap } from "./options.js";

/**
 * Sunc file read with path check
 * @param {string} path
 * @return {string}
 */
export function readFileFromPath(path) {
    let content;
    try {
        content = fs.readFileSync(path, "utf8");
    } catch (err) {
        if (err.code === "ENOENT") {
            logger.warn("Error: file not found: " + path);
            return "Error: file not found: " + path;
        } else {
            throw err;
        }
    }
    return content;
}

/**
 * Load template from template label
 * @param {object} kvMap
 * @return {string}
 */
export function getTemplateContent(kvMap) {
    const t = kvMap.template;
    const dt = defaultBookOptionsMap.template;
    const tPath = defaultTemplateMap[t];
    const dtPath = defaultTemplateMap[dt];

    const isTemplateDefault = t === dt;
    const isTemplatePath = tPath === undefined;

    let p;
    // No template option.
    if (isTemplateDefault) {
        p = dtPath;
    } else if (isTemplatePath) {
        // Template option is a path.
        p = t;
    } else {
        // Template option one of template/ directory.
        p = tPath || dtPath;
    }
    return readFileFromPath(p);
}
