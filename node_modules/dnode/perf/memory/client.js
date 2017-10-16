var dnode = require('../../');
var d = dnode();

var d = dnode.connect(7070);
var ix = 0;
d.on('remote', function fn (remote) {
    remote.zing(33, function () {
        ix++;
        if (ix % 100 === 0) console.log(ix);
        fn(remote);
    });
});
