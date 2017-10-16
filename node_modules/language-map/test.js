var map    = require('./');
var assert = require('assert');

describe('language map', function () {
  describe('module', function () {
    it('should export an object with languages as the keys', function () {
      assert.ok(map['Python'].extensions.indexOf('.py') > -1);
      assert.ok(map['JavaScript'].extensions.indexOf('.js') > -1);
    });
  });
});
