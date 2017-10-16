var test = require('tape');
var EventEmitter = require('events').EventEmitter;
var dnode = require('../');

test('emit events', function (t) {
    t.plan(1);
    
    var subs = [];
    function publish (name) {
        var args = [].slice.call(arguments, 1);
        for (var i = 0; i < subs.length; i++) {
            subs[i].emit(name, args);
        }
    }
    
    var server = function () {
        return dnode(function (remote, conn) {
            this.subscribe = function (emit) {
                subs.push({ emit : emit, id : conn.id });
                
                conn.on('end', function () {
                    for (var i = 0; i < subs.length; i++) {
                        if (subs.id === conn.id) {
                            subs.splice(i, 1);
                            break;
                        }
                    }
                });
            };
        });
    };
    
    setTimeout(function () {
        var times = 0;
        var iv = setInterval(function () {
            if (++times === 5) {
                t.deepEqual(xs, ys);
                return clearInterval(iv);
            }
            else publish('data', Math.floor(Math.random() * 100));
        }, 20);
    }, 20);
    
    var xs = [];
    var x = dnode();
    x.on('remote', function (remote) {
        var em = new EventEmitter;
        em.on('data', function (n) { xs.push(n) });
        remote.subscribe(function () { return em.emit.apply(em, arguments) });
    });
    x.pipe(server()).pipe(x);
    
    var ys = [];
    var y = dnode();
    y.on('remote', function (remote) {
        var em = new EventEmitter;
        em.on('data', function (n) { ys.push(n) });
        remote.subscribe(function () { return em.emit.apply(em, arguments) });
    });
    y.pipe(server()).pipe(y);
});
