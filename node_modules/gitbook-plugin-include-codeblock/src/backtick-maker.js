// MIT © 2017 azu
"use strict";

const codeBlockBackTick = /```/;

/**
 * backtcik count is 3 by default.
 * But, We should increase backtick if content include ```.
 * https://github.com/azu/gitbook-plugin-include-codeblock/issues/55
 * https://stackoverflow.com/questions/33224686/how-to-render-triple-backticks-as-inline-code-block-in-markdown
 * @param {string} content
 * @return {string} codebloack begin/end backtick
 */
export function codeBlockBacktick(content) {
    if (codeBlockBackTick.test(content)) {
        return "````";
    }
    return "```";
}
