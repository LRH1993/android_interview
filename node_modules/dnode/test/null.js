var dnode = require('../');
var test = require('tape');

test('null', function (t) {
    t.plan(5);
    
    var server = dnode({
        empty : null,
        timesTen : function (n, reply) {
            t.equal(n, 50);
            reply(n * 10);
        },
        moo : function (reply) { reply(100) },
        sTimesTen : function (n, cb) {
            t.equal(n, 5);
            cb(n * 10, null);
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
    
    server.pipe(client).pipe(server);
});
