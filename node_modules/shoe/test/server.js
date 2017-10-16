var http = require('http');
var shoe = require('../');
var through = require('through');

var server = http.createServer(function (req, res) {
    res.statusCode = 404;
    res.end('not found\n');
});
server.listen(process.env.PORT);

var sock = shoe(function (stream) {
    stream.pipe(through(function (buf) {
        this.queue(buf.toString('utf8').toUpperCase());
    })).pipe(stream);
});
sock.install(server, '/sock');
