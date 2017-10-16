var dnode = require('../../');
var test = require('tape');

test('port0', function (t) {
    t.plan(2);
    var port = 0;

    var server = dnode().listen(port);

    server.on('listening', function () {
      t.ok(server.address().port !== port);
      t.ok(server.address().port > 0);
      server.close();
    });
});
