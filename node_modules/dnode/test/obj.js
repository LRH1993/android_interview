var dnode = require('../');
var test = require('tape');

test('object ref tests', function (t) {
    t.plan(8);
    var obj = { a : 1, b : 2, f : function (n,g) { g(n * 20) } };
    
    var server = dnode({
        getObject : function (f) { f(obj) }
    });
    
    var client = dnode();
    client.on('remote', function (remote, conn) {
        remote.getObject(function (rObj) {
            t.equal(rObj.a, 1);
            t.equal(rObj.b, 2);
            t.equal(typeof rObj.f, 'function');
            rObj.a += 100; rObj.b += 100;
            t.equal(obj.a, 1);
            t.equal(obj.b, 2);
            t.notEqual(obj.f, rObj.g);
            t.equal(typeof obj.f, 'function');
            rObj.f(13, function (res) {
                t.equal(res, 260);
            });
        });
    });
    client.pipe(server).pipe(client);
});
