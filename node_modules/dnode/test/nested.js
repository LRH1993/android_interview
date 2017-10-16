var dnode = require('../');
var test = require('tape');
var EventEmitter = require('events').EventEmitter;

test('nested', function (t) {
    t.plan(4);
    
    var server1 = function () {
        return dnode({
            timesTen : function (n,reply) { reply(n * 10) }
        });
    };
    
    var server2 = function () {
        return dnode({
            timesTwenty : function (n,reply) { reply(n * 20) }
        });
    };
    
    var moo = new EventEmitter;
    
    var client1 = dnode();
    client1.on('remote', function (remote1, conn1) {
        var client2 = dnode();
        client2.on('remote', function (remote2, conn2) {
            moo.on('hi', function (x) {
                remote1.timesTen(x, function (res) {
                    t.equal(res, 5000, 'emitted value times ten');
                    remote2.timesTwenty(res, function (res2) {
                        t.equal(res2, 100000, 'result times twenty');
                    });
                });
            });
            remote2.timesTwenty(5, function (n) {
                t.equal(n, 100);
                remote1.timesTen(0.1, function (n) {
                    t.equal(n, 1);
                });
            });
        });
        client2.pipe(server2()).pipe(client2);
    });
    client1.pipe(server1()).pipe(client1);
    
    setTimeout(function() {
        moo.emit('hi', 500);
    }, 200);
});
