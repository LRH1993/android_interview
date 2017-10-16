var shoe = require('../');
var test = require('tape');
var through = require('through');

test('round-trip', function (t) {
    t.plan(1);
    
    var stream = shoe('/sock');
    var data = '';
    
    stream.pipe(through(function (buf) {
        data += buf;
        if (data === 'BEEP BOOP') {
            t.ok(true, 'got upper-cased data back');
        }
    }));
    
    stream.write('beep boop');
});
