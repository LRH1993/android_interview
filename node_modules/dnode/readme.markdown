# dnode

dnode is an asynchronous rpc system for node.js that lets you
call remote functions.

You can pass callbacks to remote functions, and the remote end can call
the functions you passed in with callbacks of its own and so on.
It's callbacks all the way down!

[![browser support](https://ci.testling.com/substack/dnode.png)](http://ci.testling.com/substack/dnode)

[![build status](https://secure.travis-ci.org/substack/dnode.png)](http://travis-ci.org/substack/dnode)

![dnode: freestyle rpc](http://substack.net/images/dnode.png)

# example

## listen and connect

server:

``` js
var dnode = require('dnode');
var server = dnode({
    transform : function (s, cb) {
        cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
    }
});
server.listen(5004);
```

client:

``` js
var dnode = require('dnode');

var d = dnode.connect(5004);
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});
```

output:

```
$ node server.js &
[1] 27574
$ node client.js
beep => BOOP
```

## streaming

The `.connect()` and `.listen()` calls in the previous example are just
convenience methods for piping to and from readable/writable streams.
Here's the previous example with the streams set up explicitly:

server:

``` js
var dnode = require('dnode');
var net = require('net');

var server = net.createServer(function (c) {
    var d = dnode({
        transform : function (s, cb) {
            cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
        }
    });
    c.pipe(d).pipe(c);
});

server.listen(5004);
```

client:

``` js
var dnode = require('dnode');
var net = require('net');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});

var c = net.connect(5004);
c.pipe(d).pipe(c);
```

output:

```
$ node server.js &
[1] 27586
$ node client.js 
beep => BOOP
```

## dnode in the browser

Since dnode instances are just readable/writable streams, you can use them with
any streaming transport, including in the browser!

This example uses the streaming interface provided by
[shoe](https://github.com/substack/shoe), which is just a thin wrapper on top of
[sockjs](http://sockjs.org/) that provides websockets with fallbacks.

First whip up a server:

``` js
var http = require('http');
var shoe = require('shoe');
var ecstatic = require('ecstatic')(__dirname + '/static');
var dnode = require('dnode');

var server = http.createServer(ecstatic);
server.listen(9999);

var sock = shoe(function (stream) {
    var d = dnode({
        transform : function (s, cb) {
            var res = s.replace(/[aeiou]{2,}/, 'oo').toUpperCase();
            cb(res);
        }
    });
    d.pipe(stream).pipe(d);
});
sock.install(server, '/dnode');
```

Then write some browser code:

``` js
var domready = require('domready');
var shoe = require('shoe');
var dnode = require('dnode');

domready(function () {
    var result = document.getElementById('result');
    var stream = shoe('/dnode');
    
    var d = dnode();
    d.on('remote', function (remote) {
        remote.transform('beep', function (s) {
            result.textContent = 'beep => ' + s;
        });
    });
    d.pipe(stream).pipe(d);
});
```

Install the dependencies for this example then compile the browser code with
[browserify](https://github.com/substack/node-browserify):

```
$ npm install dnode shoe domready ecstatic
$ npm install -g browserify
$ browserify client.js -o static/bundle.js
```

Now drop a script tag into static/index.html:

``` html
<script src="/bundle.js"></script>
<div id="result"></div>
```

and navigate to http://localhost:9999.
You should see `beep => BOOP` on the page!

Check out the
[complete shoe example](https://github.com/substack/dnode/tree/master/example/shoe).

# methods

``` js
var dnode = require('dnode')
```

## var d = dnode(cons, opts={})

Create a new readable/writable dnode stream object `d`.
All the usual stream methods are at your disposal: pipe(), write(), end().

If `cons` is a function, it will be called `new cons(remote, d)` to create a new
instance object. Otherwise its value will be used directly. When `cons` is
called as a function, the `remote` ref will be an empty unpopulated object.

By default, dnode uses weakmaps to garbage collect unused callbacks
automatically. This behavior prevents memory leaks in long-running connections.

You can turn weakmaps off by setting `opts.weak = false`.

## d.connect(...)

This method is a shortcut for setting up a pipe between `d` and a new
`net.connect()` stream.

The host, port, and callback arguments supplied will be inferred by their
types.

If you pass a callback in as an argument, it will be added as a listener to the
`'remote'` event.

Returns the `d` object.

## dnode.connect(...)

Shortcut to create a connection without a constructor.

## d.listen(...)

This method is a shortcut for setting up a `net.createServer()` and piping
network streams to and from new dnode streams.

The host, port, and callback parameters will be inferred from the types of the
arguments.

Returns a net server object that will also emit `'local'` and `'remote'` events
from the underlying dnode streams..

## dnode.listen(...)

Shortcut to create a listener without a constructor.

# events

## d.on('remote', cb)

This event fires with `cb(remote, d)` when the remote side of the connection
has constructed its instance.

## d.on('local', cb)

This event fires right after the constructed instance has been created locally
but before it gets sent to the remote end so you can modify the ref object.

This event fires with `cb(ref, d)` where `ref` is the local instance object.

## d.on('fail', cb)

This event fires when the remote end causes errors in the protocol layer.

These are non-fatal and can probably be ignored but you could also terminate the
connection here.

## d.on('error', cb)

This event fires when local code causes errors in its callbacks.
Not all errors can be caught here since some might be in async functions.

## d.on('end', cb)

This event fires when the input stream finishes.

# install

With [npm](http://npmjs.org) do:

```
npm install dnode
```

# protocol

dnode uses a newline-terminated JSON protocol
[documented in the dnode-protocol project](https://github.com/substack/dnode-protocol/blob/master/doc/protocol.markdown#the-protocol).

# dnode in other languages

These libraries implement the dnode protocol too so you can make RPC calls
between scripts written in different languages.

* [dnode-perl](http://github.com/substack/dnode-perl)
* [dnode-ruby](http://github.com/substack/dnode-ruby)
* [dnode-php](https://github.com/bergie/dnode-php)
* [dnode-php-sync-client](https://github.com/erasys/dnode-php-sync-client)
* [dnode-java](https://github.com/aslakhellesoy/dnode-java)

# shameless plug

Want to make sure your crazy javascript-heavy app still works in other
browsers?
Give [browserling](http://browserling.com) a spin!
Browsers in your browser. Powered by dnode.

