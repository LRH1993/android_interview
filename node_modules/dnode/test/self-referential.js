var dnode = require('../')
var test = require('tape');

test('self-referential', function (t) {
    t.plan(7);
    
    var server = dnode({
        timesTen : function (n,reply) {
            t.equal(n.number, 5);
            reply(n.number * 10);
        },
        print : function (n,reply) {
            t.strictEqual(n[0],1);
            t.strictEqual(n[1],2);
            t.strictEqual(n[2],3);
            t.strictEqual(n[3],n);
            reply(n);
        }
    });
    
    var client = dnode();
    client.on('remote', function (remote) {
        var args = [1,2,3]
        args.push(args)
        
        remote.print(args, function (m) {
            t.same(m.slice(0,3), args.slice(0,3));
            t.equal(m, m[3]);
            t.equal(args, args[3]);
        });
    });
    
    client.pipe(server).pipe(client);
});
