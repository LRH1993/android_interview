var dnode = require('../');
var test = require('tape');

test('refs', function (t) {
    t.plan(2);
    
    var server = dnode({
        a : 1,
        b : 2
    });
    
    var client = dnode();
    client.on('remote', function (remote) {
        t.equal(remote.a, 1);
        t.equal(remote.b, 2);
    });
    
    client.pipe(server).pipe(client);
});
