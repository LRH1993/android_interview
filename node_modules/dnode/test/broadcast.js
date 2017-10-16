var dnode = require('../');
var EventEmitter = require('events').EventEmitter;
var test = require('tape');

test('broadcast', function (t) {
    t.plan(3);
    
    var em = new EventEmitter;
    var server = function () {
        return dnode(function (client, conn) {
            conn.on('ready', function () {
                em.on('message', client.message);
            });
            
            conn.on('end', function () {
                em.removeListener('message', client.message);
            });
            
            this.message = function (msg) {
                em.emit('message', client.name + ' says: ' + msg);
            };
        });
    };
    
    var recv = { 0 : [], 1 : [], 2 : [] };
    
    var client0 = dnode({
        name : '#0',
        message : function (msg) { recv[0].push(msg) }
    });
    client0.on('remote', function (remote) {
        setTimeout(function () {
            remote.message('hello!');
        }, 25);
    });
    client0.pipe(server()).pipe(client0);
    
    var client1 = dnode({
        name : '#1',
        message : function (msg) { recv[1].push(msg) }
    });
    client1.on('remote', function (remote) {
        setTimeout(function () {
            remote.message('hey');
        }, 50);
    });
    client1.pipe(server()).pipe(client1);
    
    var client2 = dnode({
        name : '#2',
        message : function (msg) { recv[2].push(msg) }
    });
    client2.on('remote', function (remote) {
        setTimeout(function () {
            remote.message('wowsy');
        }, 75);
    });
    client2.pipe(server()).pipe(client2);
    
    setTimeout(function () {
        t.deepEqual(
            recv[0],
            [ '#0 says: hello!', '#1 says: hey', '#2 says: wowsy' ],
            "#0 didn't get the right messages"
        );
        t.deepEqual(recv[0], recv[1], "#1 didn't get the messages");
        t.deepEqual(recv[0], recv[2], "#2 didn't get the messages");
    }, 150);
});
