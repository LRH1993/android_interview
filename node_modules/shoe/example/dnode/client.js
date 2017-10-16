var shoe = require('../../');
var dnode = require('dnode');

var result = document.getElementById('result');
var stream = shoe('/dnode');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        result.textContent = 'beep => ' + s;
    });
});
d.pipe(stream).pipe(d);
