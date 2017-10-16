var assert = require('assert');
var weak = require('../')

function checkFunction (prop) {
  it('should have a function "' + prop + '"', function () {
    assert('function' == typeof weak[prop]);
  })
}

describe('exports', function () {

  afterEach(gc)

  it('should be a function', function () {
    assert('function' == typeof weak);
  })

  checkFunction('get')
  checkFunction('create')
  checkFunction('isWeakRef')
  checkFunction('isNearDeath')
  checkFunction('isDead')
  checkFunction('callbacks')
  checkFunction('addCallback')
  checkFunction('removeCallback')
  checkFunction('removeCallbacks')

  it('should be a circular reference to "create"', function () {
    assert(weak === weak.create);
  })

})
