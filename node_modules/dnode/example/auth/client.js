var dnode = require('dnode');

if (process.argv.length < 4) {
    return console.error('Usage: ./client.js user pass');
}

var user = process.argv[2];
var pass = process.argv[3];

var d = dnode.connect(7007);
d.on('remote', function (remote) {
    remote.auth(user, pass, function (err, session) {
        if (err) {
            console.error(err);
            return d.end();
        }
        
        session.quote(function (q) {
            console.log('And now for a quote by ' + q.who + ':\n');
            console.log(q.quote + '\n');
            d.end();
        });
    });
});
