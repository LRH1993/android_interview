var dnode = require('../');
var test = require('tape');

test('stream', function (t) {
    t.plan(2);
    
    var server = dnode({
        meow : function f (g) { g('cats') }
    });
    server.on('remote', function (remote) {
        t.equal(remote.x, 5);
    });
    
    var client = dnode({ x : 5 });
    client.on('remote', function (remote) {
        remote.meow(function (cats) {
            t.equal(cats, 'cats');
        });
    });
    
    client.pipe(server).pipe(client);
});
