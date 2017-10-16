var dnode = require('../');
var test = require('tape');

test('middleware', function (t) {
    t.plan(5);
    
    var tf = setTimeout(function () {
        t.fail('never finished');
    }, 1000);
    
    var tr = setTimeout(function () {
        t.fail('never ready');
    }, 1000);
    
    var tc = setTimeout(function () {
        t.fail('connection not ready');
    }, 1000);
    
    var server = dnode(function (client, conn) {
        var self = this;
        t.ok(!conn.zing);
        t.ok(!client.moo);
        
        conn.on('remote', function () {
            clearTimeout(tr);
            t.ok(conn.zing);
            t.ok(self.moo);
        });
        
        this.baz = 42;
    });
    
    server.on('local', function (client, conn) {
        conn.zing = true;
    });
    
    server.on('local', function (client, conn) {
        client.moo = true;
        conn.on('remote', function () {
            clearTimeout(tc);
        });
    });
    
    var client = dnode();
    client.on('remote', function (remote, conn) {
        clearTimeout(tf);
        t.ok(remote.baz);
    });
    
    server.pipe(client).pipe(server);
});
