var dnode = require('../');
var test = require('tape');

test('bidirectional', function (t) {
    t.plan(3);
    
    var server = dnode(function (client) {
        this.timesX = function (n,f) {
            t.equal(n, 3, "timesX's n == 3");
            
            client.x(function (x) {
                t.equal(x, 20, 'client.x == 20');
                f(n * x);
            });
        }; 
    });
    
    var client = dnode({
        x : function (f) { f(20) }
    });
    client.on('remote', function (remote) {
        remote.timesX(3, function (res) {
            t.equal(res, 60, 'result of 20 * 3 == 60');
            client.end();
            server.end();
        });
    });
    
    client.pipe(server).pipe(client);
});
