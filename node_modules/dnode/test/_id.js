var dnode = require('../');
var test = require('tape');

test('_id', function (t) {
    t.plan(1);
    
    var server = dnode({ _id : 1337 });
    var client = dnode();
    client.on('remote', function (remote, conn) {
        t.equal(remote._id, 1337);
    });
    client.pipe(server).pipe(client);
});
