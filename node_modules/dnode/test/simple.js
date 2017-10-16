var dnode = require('../');
var test = require('tape');

test('simple server and client', function (t) {
    t.plan(5);
    
    var server = dnode({
        timesTen : function (n,reply) {
            t.equal(n, 50);
            reply(n * 10);
        },
        moo : function (reply) { reply(100) },
        sTimesTen : function (n, cb) {
            t.equal(n, 5);
            cb(n * 10);
        }
    });
    
    var client = dnode();
    client.on('remote', function (remote) {
        remote.moo(function (x) {
            t.equal(x, 100, 'remote moo == 100');
        });
        remote.sTimesTen(5, function (m) {
            t.equal(m, 50, '5 * 10 == 50');
            remote.timesTen(m, function (n) {
                t.equal(n, 500, '50 * 10 == 500');
            });
        });
    });
    
    server.on('end', function () {
        console.log('server END');
    });
    client.on('end', function () {
        console.log('client END');
    });
    server.pipe(client).pipe(server);
});
