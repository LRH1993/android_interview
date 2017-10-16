shoe
====

Streaming sockjs for node and the browser.

This is a more streaming,
[more unixy](http://www.faqs.org/docs/artu/ch01s06.html)
take on [sockjs](https://github.com/sockjs/sockjs-node).

* works with [browserify](https://github.com/substack/node-browserify)
([modularity](http://www.faqs.org/docs/artu/ch01s06.html#id2877537))
* stream all the things
([composition](http://www.faqs.org/docs/artu/ch01s06.html#id2877684))
* emits a `'log'` event instead of spamming stdout
([silence](http://www.faqs.org/docs/artu/ch01s06.html#id2878450))

![shoe point javascript](http://substack.net/images/shoe.png)

example
=======

stream all the things
---------------------

Browser code that takes in a stream of 0s and 1s from the server and inverts
them:

``` js
var shoe = require('shoe');
var through = require('through');

var result = document.getElementById('result');

var stream = shoe('/invert');
stream.pipe(through(function (msg) {
    result.appendChild(document.createTextNode(msg));
    this.queue(String(Number(msg)^1));
})).pipe(stream);
```

Server code that hosts some static files and emits 0s and 1s:

``` js
var shoe = require('shoe');
var http = require('http');

var ecstatic = require('ecstatic')(__dirname + '/static');

var server = http.createServer(ecstatic);
server.listen(9999);

var sock = shoe(function (stream) {
    var iv = setInterval(function () {
        stream.write(Math.floor(Math.random() * 2));
    }, 250);
    
    stream.on('end', function () {
        clearInterval(iv);
    });
    
    stream.pipe(process.stdout, { end : false });
});
sock.install(server, '/invert');
```

The server emits 0s and 1s to the browser, the browser inverts them and sends
them back, and the server dumps the binary digits to stdout.

By default, there's no logspam on stdout to clutter the output, which is a
frustrating trend in realtimey websocket libraries that violates the
[rule of silence](http://www.faqs.org/docs/artu/ch01s06.html#id2878450).

Just wait for a client to connect and you'll see:

```
$ node server.js
001011010101101000101110010000100
```

with dnode
----------

Since dnode has a simple streaming api it's very simple to plug into shoe.

Just hack up some browser code:

``` js
var shoe = require('shoe');
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
```
and hack up a server piping shoe streams into dnode:

``` js
var shoe = require('shoe');
var dnode = require('dnode');

var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');

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

Then open up `localhost:9999` in your browser and you should see:

```
beep => BOOP
```

with express or connect
-----------------------

you must pass the return value of `app.listen(port)`

``` js
var shoe = require('shoe');

var express = require('express')
var app = express()

var sock = shoe(function (stream) { ... });

// *** must pass expcess/connect apps like this:
sock.install(app.listen(9999), '/dnode');
```

with reconnect
--------------

you can use [reconnect](https://github.com/dominictarr/reconnect) just in case your sock ends or gets disconnected.

``` js
var shoe = require('shoe');
var reconnect = require('reconnect');
var es = require('event-stream');
var result = document.getElementById('result');

var r = reconnect(function (stream) {

  var s = es.mapSync(function (msg) {
      result.appendChild(document.createTextNode(msg));
      return String(Number(msg)^1);
  });
  s.pipe(stream).pipe(s);

}).connect('/invert')

```

browser methods
===============

``` js
var shoe = require('shoe')
```

var stream = shoe(uri, cb)
--------------------------

Return a readable/writable stream from the sockjs path `uri`.
`uri` may be a full uri or just a path.

`shoe` will emit a `'connect'` event when the connection is actually open,
(just like in [net](http://nodejs.org/api/net.html#net_net_connect_options_connectionlistener)).
writes performed before the `'connect'` event will be buffered. passing in `cb` to 
shoe is a shortcut for `shoe(uri).on('connect', cb)`

server methods
==============

``` js
var shoe = require('shoe')
```

All the methods from the sockjs exports objects are attached onto the `shoe`
function, but the `shoe()` function itself is special.

var sock = shoe(opts, cb)
-------------------------

Create a server with `sockjs.createServer(opts)` except this function also adds
the `.install()` function below.

If `cb` is specified, it fires `cb(stream)` on `'connection'` events.

sock.install(server, opts)
--------------------------

Call `sock.installHandler()` with the default option of spamming stdout with log
messages switched off in place of just emitting `'log'` messages
on the `sock` object instead. This is a much less spammy default that gets out
of your way.

If `opts` is a string, use it as the `opts.prefix`.

server events
=============

All the messages that sockjs normally emits will be available on the `sock`
object plus the events below:

sock.on('log', function (severity, msg) { ... })
------------------------------------------------

Using the default logger with `sock.install()` will cause these `'log'` messages
to be emitted instead of spamming stdout.

install
=======

With [npm](http://npmjs.org) do:

```
npm install shoe
```

license
=======

MIT
