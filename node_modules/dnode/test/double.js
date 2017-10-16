var dnode = require('../');
var test = require('tape');

test('double', function (t) {
    t.plan(4);
    var port = Math.floor(Math.random() * 40000 + 10000);
    
    var server = dnode({
        z : function (f, g, h) {
            f(10, function (x) {
                g(10, function (y) {
                    h(x,y)
                })
            })
        }
    });
    
    var client = dnode();
    client.on('remote', function (remote) {
        remote.z(
            function (x,f) { f(x * 2) },
            function (x,f) { f(x / 2) },
            function (x,y) {
                t.equal(x, 20, 'double, not equal');
                t.equal(y, 5, 'double, not equal');
            }
        );
        
        function plusTen(n,f) { f(n + 10) }
        
        remote.z(plusTen, plusTen, function (x,y) {
            t.equal(x, 20, 'double, equal');
            t.equal(y, 20, 'double, equal');
        });
    });
    
    client.pipe(server).pipe(client);
});
