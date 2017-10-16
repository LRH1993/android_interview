// LICENSE : MIT
"use strict";
const path = require("path");
const Handlebars = require("handlebars");
const logger = require("winston-color");
import { defaultKeyValueMap, initOptions, checkMapTypes } from "./options.js";
import { unescapeString } from "./unescape-string.js";
import { getLang } from "./language-detection";
import { getMarker, hasMarker, markerSliceCode, removeMarkers } from "./marker";
import { sliceCode, hasSliceRange, getSliceRange } from "./slicer";
import { hasTitle } from "./title";
import { getTemplateContent, readFileFromPath } from "./template";
import { codeBlockBacktick } from "./backtick-maker";

const markdownLinkFormatRegExp = /\[(?=((?:[^\]]|\\.)*))\1\]\((?=((?:[^\)]|\\.)*))\2\)/gm;

const keyEx = "\\w+";
const kvsepEx = "[:=]";
const spacesEx = "\\s*";
const quoteEx = "[\"']";
const valEx = "(?:[^'\"\\\\]|\\\\.)*";
const argEx = `${quoteEx}${valEx}${quoteEx}|true|false`;
const expressionEx = `(${keyEx})${kvsepEx}${spacesEx}(${argEx})`;
const expressionRegExp = new RegExp(expressionEx, "g");

const markerRegExp = /^\s*(([-\w\s]*,?)*)$/;

/**
 * A counter to count how many code are imported.
 */
var codeCounter = (function() {
    var count = 0;
    return function() {
        return count++;
    }; // Return and increment
})();

/**
 * split label to commands
 * @param {string} label
 * @returns {Array}
 */
export function splitLabelToCommands(label = "") {
    const result = label.split(/(:|[,\s])/);
    if (!result) {
        return [];
    }
    // remove null command
    return result
        .map(command => {
            return command.trim();
        })
        .filter(command => {
            return command.length > 0;
        });
}

/**
 * Unindent code
 * @param {string} s
 * @return {string}
 */
export function strip(s) {
    // inspired from https://github.com/rails/rails/blob/master/activesupport/lib/active_support/core_ext/string/strip.rb
    if (s === undefined || s === "") {
        return s;
    }
    const indents = s
        .split(/\n/)
        .map(s => s.match(/^[ \t]*(?=\S)/))
        .filter(m => m)
        .map(m => m[0]);
    const smallestIndent = indents.sort((a, b) => a.length - b.length)[0];
    return s.replace(new RegExp(`^${smallestIndent}`, "gm"), "");
}

/**
 * if contain "include" or "import" command, then return true
 * @param {Array} commands
 * @returns {boolean}
 */
export function containIncludeCommand(commands = []) {
    const reg = /^(include|import)$/;
    return commands.some(command => {
        return reg.test(command.trim());
    });
}

/**
 * Parse the given value to the given type. Returns the value if valid, otherwise returns undefined.
 * @param {string} value
 * @param {string} type "string", "boolean"
 * @param {string} key
 * @return {boolean|string|undefined}
 */
export function parseValue(value, type, key) {
    if (type === "string") {
        const unescapedvalue = unescapeString(value.substring(1, value.length - 1));
        if (key === "marker" && !markerRegExp.test(unescapedvalue)) {
            logger.error(
                "include-codeblock: parseVariablesFromLabel: invalid value " +
                    `\`${unescapedvalue}\` in key \`marker\``
            );
            return undefined;
        }
        return unescapedvalue;
    }

    if (type === "boolean") {
        if (["true", '"true"', "'true'"].indexOf(value) >= 0) {
            return true;
        }

        if (["false", '"false"', "'false'"].indexOf(value) >= 0) {
            return false;
        }

        logger.error(
            "include-codeblock: parseVariablesFromLabel: invalid value " +
                `\`${value}\` in key \`${key}\`. Expect true or false.`
        );
        return undefined;
    }

    logger.error(
        `include-codeblock: parseVariablesFromLabel: unknown key type \`${type}\` (see options.js)`
    );
    return undefined;
}

/** Parse the command label and return a new key-value object
 * @example
 *      [import,title:"<thetitle>",label:"<thelabel>"](path/to/file.ext)
 * @param {object} kvMap
 * @param {string} label
 * @return {object}
 */
export function parseVariablesFromLabel(kvMap, label) {
    const kv = Object.assign({}, kvMap);

    let match = "";
    while ((match = expressionRegExp.exec(label))) {
        let key = match[1];
        if (key === "include" || key === "import") {
            key = "marker";
        }
        const value = match[2];

        if (!kv.hasOwnProperty(key)) {
            logger.error(
                "include-codeblock: parseVariablesFromLabel: unknown key " +
                    `\`${key}\` (see options.js)`
            );
            return;
        }

        const parsedValue = parseValue(value, typeof defaultKeyValueMap[key], key);
        if (parsedValue !== undefined) {
            kv[key] = parsedValue;
        }
    }

    return Object.freeze(kv);
}

/**
 * generate code from options
 * @param {object} kvMap
 * @param {string} fileName
 * @param {string} originalPath
 * @param {string} content
 * @param {string} backtick
 * @return {string}
 */
export function generateEmbedCode(kvMap, { fileName, originalPath, content, backtick }) {
    const tContent = getTemplateContent(kvMap);
    const kv = Object.assign({}, kvMap);
    const count = hasTitle(kv) ? codeCounter() : -1;
    checkMapTypes(kvMap, "generatedEmbedCode");
    const contextMap = Object.assign({}, kvMap, {
        content: content,
        count: count,
        fileName: fileName,
        originalPath: originalPath,
        backtick
    });
    // compile template
    const handlebars = Handlebars.compile(tContent);
    // compile with data.
    return handlebars(contextMap);
}

/**
 * return content from file or url.
 * @param {string} filePath it should be absolute path
 * @return {string}
 */
export function getContent(filePath) {
    return readFileFromPath(filePath);
}

/**
 * generate code with options
 * @param {object} kvMap
 * @param {string} filePath
 * @param {string} originalPath
 * @param {string} label
 * @return {string}
 */
export function embedCode(kvMap, { filePath, originalPath, label }) {
    const code = getContent(filePath);
    const fileName = path.basename(filePath);
    const kvmparsed = parseVariablesFromLabel(kvMap, label);
    const kvm = getLang(kvmparsed, originalPath);
    const unindent = kvm.unindent;

    let content = code;
    // Slice content via line numbers.
    if (hasSliceRange(label)) {
        const [start, end] = getSliceRange(label);
        content = sliceCode(code, start, end, unindent);
    } else if (hasMarker(kvm)) {
        // Slice content via markers.
        const marker = getMarker(kvm);
        content = removeMarkers(markerSliceCode(code, marker));
    }
    if (unindent === true) {
        content = strip(content);
    }

    const backtick = codeBlockBacktick(content);
    return generateEmbedCode(kvm, { fileName, originalPath, content, backtick });
}

/**
 * Parse command using options from pluginConfig.
 * @param {string} content
 * @param {string} baseDir
 * @param {{template?: string}} options
 * @return {Array}
 */
export function parse(content, baseDir, options = {}) {
    const results = [];
    const kvMap = initOptions(options);
    let res = true;
    while ((res = markdownLinkFormatRegExp.exec(content))) {
        const [all, label, originalPath] = res;
        const commands = splitLabelToCommands(label);
        if (containIncludeCommand(commands)) {
            const absolutePath = path.resolve(baseDir, originalPath);
            const replacedContent = embedCode(kvMap, {
                filePath: absolutePath,
                originalPath: originalPath,
                label
            });
            results.push({
                target: all,
                replaced: replacedContent
            });
        }
    }
    return results;
}
