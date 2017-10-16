const logger = require("winston-color");
/* eslint-disable */
// Check that ace plugin is loaded after include-codeblock
export function aceCheck() {
    // Check ace is used.
    try {
        require.resolve("gitbook-plugin-ace");

        // Check is not currently loaded.
        const aceLoaded = Boolean(require("module")._cache[require.resolve("gitbook-plugin-ace")]);
        if (aceLoaded) {
            console.log(""); // flush
            logger.error(
                "`gitbook-plugin-include-codeblock` plugin must be loaded before `gitbook-plugin-ace`!"
            );
        }
    } catch (e) {
        console.log(""); // flush
        logger.warn("ace features disabled (`gitbook-plugin-ace` required)");
    }
}

/* eslint-enable */
