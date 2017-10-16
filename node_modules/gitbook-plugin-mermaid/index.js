var path         = require('path');
var readFileSync = require('fs').readFileSync;
var url          = require('url');

var phantom = require('phantom');
var Q       = require('q');


const PHANTOMJS_MODULE = require.resolve('phantomjs')
const PHANTOMJS_BIN = path.resolve(PHANTOMJS_MODULE, '../../bin', 'phantomjs')


module.exports = {
  blocks: {
    mermaid: {
      process: function(block) {
        var body = block.body;

        var src = block.kwargs.src;
        if(src) {
          var relativeSrcPath = url.resolve(this.ctx.file.path, src)
          var absoluteSrcPath = decodeURI(path.resolve(this.book.root, relativeSrcPath))
          body = readFileSync(absoluteSrcPath, 'utf8')
        }

        return processBlock(body);
      }
    }
  }
};

function processBlock(body) {
  return convertToSvg(body)
      .then(function (svgCode) {
          return svgCode.replace(/mermaidChart1/g, getId());
      });
}

function convertToSvg(mermaidCode) {
  var deferred = Q.defer();
  phantom.create({binary: PHANTOMJS_BIN}, function (ph) {
    ph.createPage(function (page) {

      var htmlPagePath = path.join(__dirname, 'convert/converter.html');

      page.open(htmlPagePath, function (status) {
        page.evaluate(
          function (code) {
            return renderToSvg(code);
          },
          function (result) {
            ph.exit();
            deferred.resolve(result);
          },
          mermaidCode);
      });
    });
  });

  return deferred.promise;
}

function getId() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return "mermaidChart-" + s4() + s4();
}
