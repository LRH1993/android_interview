// LICENSE : MIT
"use strict";
const path = require("path");
const languageMap = require("language-map");
const logger = require("winston-color");
import { defaultKeyValueMap } from "./options.js";

// Workaround for not working languages.
// Redefine aceMode locally.
// @param {string}
// @return {string}
export function languageAceModeFix(resultAceMode) {
    if (resultAceMode == "c_cpp") {
        resultAceMode = "cpp";
    }
    return resultAceMode;
}

/**
 * Return aceMode from lang in kvMap.
 * @param {object} kvMap
 * @return {object}
 */
export function lookupLanguageByAceMode(kvMap) {
    let resultAceMode;
    const matchLang = kvMap.lang;
    Object.keys(languageMap).some(langKey => {
        const aceMode = languageMap[langKey].aceMode;
        if (matchLang === aceMode) {
            resultAceMode = aceMode;
            return resultAceMode;
        }
        return undefined;
    });
    return resultAceMode;
}

/**
 * Return aceMode from file extension or lang in kvMap, if is 
 * an extension.
 * @param {object} kvMap
 * @param {string} filePath
 * @return {object}
 */
export function lookupLanguageByExtension(kvMap, filePath) {
    const lang = kvMap.lang;
    let ext;
    // Check first if map `lang` is an extension string.
    const matchext = /(.+)/g.exec(lang);
    if (matchext != null) {
        ext = matchext[1];
    } else {
        // Load from file extension.
        ext = path.extname(filePath);
    }
    let aceMode;
    Object.keys(languageMap).some(langKey => {
        const extensions = languageMap[langKey].extensions;
        if (!extensions) {
            return false;
        }
        return extensions.some(extension => {
            if (ext === extension) {
                aceMode = languageMap[langKey].aceMode;
            }
            return false;
        });
    });
    return aceMode;
}

/**
 * Update key-value map lang with aceMode lang.
 * @param {object} kvMap
 * @param {string} filePath
 * @return {object}
 */
export function getLang(kvMap, filePath) {
    let aceMode;
    // Retrieve ace mode from lang.
    if (kvMap.lang !== defaultKeyValueMap.lang) {
        aceMode = lookupLanguageByAceMode(kvMap);
    }
    // Retrieve ace mode from file ext or lang ext.
    if (aceMode === undefined) {
        aceMode = lookupLanguageByExtension(kvMap, filePath);
    }
    // Ace mode not found, keep default.
    if (aceMode === undefined) {
        logger.warn("include-codeblock: unknown language `" + kvMap.lang + "`, use default");
        return kvMap;
    }
    if (kvMap.fixlang) {
        aceMode = languageAceModeFix(aceMode);
    }
    const kvm = Object.assign({}, kvMap);
    kvm.lang = aceMode;
    return Object.freeze(kvm);
}
