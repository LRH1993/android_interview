var sockjs = require('sockjs');

exports = module.exports = function (opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = {};
    }
    var server = sockjs.createServer();
    var handler = function (stream) {
        var _didTimeout = stream._session.didTimeout
        var _didClose = stream._session.didClose

        stream._session.didTimeout = function () {
            cleanup()
            _didTimeout.apply(this, arguments)
        }
        stream._session.didClose = function () {
            cleanup()
            _didClose.apply(this, arguments)
        }

        cb(stream)

        function cleanup() {
            stream.emit("close")
            if (stream.destroy) {
                stream.destroy()
            }
        }
    }
    if (typeof cb === 'function') {
        server.on('connection', handler);
    }
    server.install = function (httpServer, hopts) {
        if (hopts && hopts.listen && !httpServer.listen) {
            httpServer = arguments[1];
            hopts = arguments[0];
        }
        if (typeof hopts === 'string') {
            hopts = { prefix : hopts };
        }
        if (!hopts) hopts = {};
        if (hopts.log === undefined) {
            // spamming stdout by default is VERY infuriating,
            // emit an event instead
            hopts.log = function (severity, line) {
                server.emit('log', severity, line);
            };
        }
        server.installHandlers(httpServer, hopts);
        return server;
    };
    
    return server;
};

for (var key in sockjs) {
    exports[key] = sockjs[key];
}
