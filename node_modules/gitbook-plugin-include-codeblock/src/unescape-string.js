// The code in this file is extracted from commonmark.js
// (https://github.com/jgm/commonmark.js), which is owned by John MacFarlane.
// LICENSE : BSD-2-Clause
"use strict";

var decodeHTML = require("entities").decodeHTML;

var C_BACKSLASH = 92;
var ENTITY = "&(?:#x[a-f0-9]{1,8}|#[0-9]{1,8}|[a-z][a-z0-9]{1,31});";
var reBackslashOrAmp = /[\\&]/;
var ESCAPABLE = "[!\"#$%&'()*+,./:;<=>?@[\\\\\\]^_`{|}~-]";
var reEntityOrEscapedChar = new RegExp("\\\\" + ESCAPABLE + "|" + ENTITY, "gi");

function unescapeChar(s) {
    if (s.charCodeAt(0) === C_BACKSLASH) {
        return s.charAt(1);
    } else {
        return decodeHTML(s);
    }
}

// Replace entities and backslash escapes with literal characters.
export function unescapeString(s) {
    if (reBackslashOrAmp.test(s)) {
        return s.replace(reEntityOrEscapedChar, unescapeChar);
    } else {
        return s;
    }
}
