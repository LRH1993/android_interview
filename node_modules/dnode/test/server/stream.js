var dnode = require('../../');
var net = require('net');
var test = require('tape');

test('stream', function (t) {
    t.plan(2);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = net.createServer(function (stream) {
        var d = dnode({
            meow : function f (g) { g('cats') }
        });
        d.on('remote', function (remote) {
            t.equal(remote.x, 5);
        });
        stream.pipe(d).pipe(stream);
    });
    server.listen(port);
    
    server.on('listening', function () {
        var d = dnode({ x : 5 });
        d.on('remote', function (remote) {
            remote.meow(function (cats) {
                t.equal(cats, 'cats');
                server.close();
                d.end();
            });
        });
        
        var stream = net.connect(port);
        d.pipe(stream).pipe(d);
    });
});
