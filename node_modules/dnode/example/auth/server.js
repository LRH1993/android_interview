var dnode = require('dnode');
var fs = require('fs');
var net = require('net');

var secretQuotes = require('./quotes.json');
function randomQuote (cb) {
    var ix = Math.floor(Math.random() * secretQuotes.length);
    cb(secretQuotes[ix]);
}

var server = net.createServer(function (stream) {
    var d = dnode({ auth : auth });
    d.pipe(stream).pipe(d);
    
    function auth (user, pass, cb) {
        if (typeof cb !== 'function') return;
        
        if (user === 'moo' && pass === 'hax') {
            console.log('signed in: ' + user);
            d.on('end', function () {
                console.log('disconnected: ' + user);
            });
            
            cb(null, { quote : randomQuote });
        }
        else cb('ACCESS DENIED')
    }
});
server.listen(7007);
