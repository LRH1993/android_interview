var test = require('tape');

var parseArgs = require('../lib/parse_args');

function argv () { return arguments }

test('args', function (t) {
    t.deepEqual(
        parseArgs(argv('moo.com', 555)),
        { host : 'moo.com', port : 555 }
    );
    
    t.deepEqual(
        parseArgs(argv('7777')),
        { port : 7777 }
    );
    
    t.deepEqual(
        parseArgs(argv({
            host : 'moosy.moo.com',
            port : 5050
        })),
        { host : 'moosy.moo.com', port : 5050 }
    );
    
    t.deepEqual(
        parseArgs(argv('meow.cats.com', { port : '1234' })),
        { host : 'meow.cats.com', port : 1234 }
    );
    
    t.deepEqual(
        typeof parseArgs(argv('789')).port,
        'number'
    );
    
    t.deepEqual(
        parseArgs(argv(
            { host : 'woof.dogs.com' }, { port : 4050 }
        )),
        { host : 'woof.dogs.com', port : 4050 }
    );
    
    t.deepEqual(
        parseArgs(argv(
            undefined,
            { host : 'woof.dogs.com' },
            undefined,
            { port : 4050 },
            undefined
        )),
        { host : 'woof.dogs.com', port : 4050 }
    );
    
    t.end();
});
