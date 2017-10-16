var dnode = require('../');
var test = require('tape');

test('circular refs', function (t) {
    t.plan(7);
    
    var server = dnode({
        sendObj : function (ref, f) {
            t.equal(ref.a, 1);
            t.equal(ref.b, 2);
            t.deepEqual(ref.c, ref);
            
            ref.d = ref.c;
            
            f(ref);
        }
    });
    
    var client = dnode();
    client.on('remote', function (remote) {
        var obj = { a : 1, b : 2 };
        obj.c = obj;
        
        remote.sendObj(obj, function (ref) {
            t.equal(ref.a, 1);
            t.equal(ref.b, 2);
            t.deepEqual(ref.c, ref);
            t.deepEqual(ref.d, ref);
        });
    });
    
    client.pipe(server).pipe(client);
});
