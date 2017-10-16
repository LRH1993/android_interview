module.exports = function (argv) {
    var params = {};
    for (var i = 0; i < argv.length; i++) {
        var arg = argv[i];
        
        if (typeof arg === 'string') {
            if (arg.match(/^\d+$/)) {
                params.port = parseInt(arg, 10);
            }
            else if (arg.match('^/')) {
                params.path = arg;
            }
            else {
                params.host = arg;
            }
        }
        else if (typeof arg === 'number') {
            params.port = arg;
        }
        else if (typeof arg === 'function') {
            params.block = arg;
        }
        else if (typeof arg === 'object') {
            for (var key in arg) {
                if (key === 'port') {
                    params[key] = parseInt(arg[key], 10)
                }
                else params[key] = arg[key]
            }
        }
        // ignore everything else
    };
    
    return params;
};
