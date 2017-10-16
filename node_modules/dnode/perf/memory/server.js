var dnode = require('../../');
var net = require('net');

var server = net.createServer(function (stream) {
    var d = dnode(function (remote) {
        this.zing = function (n, cb) { cb(n * 100) };
    });
    d.pipe(stream).pipe(d);
});
server.listen(7070);

setInterval(function () {
    var mem = process.memoryUsage();
    var m = mem.heapTotal / 1024 / 1024;
    console.log(Math.round(m * 100) / 100 + ' MB');
}, 1000);
