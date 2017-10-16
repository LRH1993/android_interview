var katex = require("katex");

module.exports = {
    book: {
        assets: "./static",
        js: [],
        css: [
            "katex.min.css"
        ]
    },
    ebook: {
        assets: "./static",
        css: [
            "katex.min.css"
        ]
    },
    blocks: {
        math: {
            shortcuts: {
                parsers: ["markdown", "asciidoc", "restructuredtext"],
                start: "$$",
                end: "$$"
            },
            process: function(blk) {
                var tex = blk.body;
                var isInline = !(tex[0] == "\n");
                var output = katex.renderToString(tex, {
                    displayMode: !isInline
                });

                return output;
            }
        }
    }
};
