Winston = require("winston")

var logger = new Winston.Logger({
    transports: [
        new Winston.transports.Console({
            level: "debug",
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ]
});

module.exports = logger;
