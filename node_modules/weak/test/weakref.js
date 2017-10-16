var assert = require('assert')
var weak = require('../')

describe('Weakref', function () {

  afterEach(gc)

  it('weak() should return a `Weakref` instance', function () {
    var ref = weak({})
    assert(weak.isWeakRef(ref))
  })

  it('should proxy named gets to the target', function () {
    var o = { foo: 'bar' }
      , r = weak(o)
    assert.equal(r.foo, 'bar')
  })

  it('should proxy named sets to the target', function () {
    var o = {}
      , r = weak(o)
    r.foo = 'bar'
    assert.equal(r.foo, 'bar')
  })

  it('should proxy named deletes to the target', function () {
    var o = { foo: 'bar' }
     ,  r = weak(o)
    delete r.foo
    assert(!r.foo)
  })

  it('should proxy indexed gets to the target', function () {
    var a = [ 'foo' ]
      , r = weak(a)
    assert.equal(1, a.length)
    assert.equal(1, r.length)
    assert.equal('foo', r[0])
  })

  it('should proxy indexed sets to the target', function () {
    var a = []
      , r = weak(a)
    assert.equal(0, a.length)
    assert.equal(0, r.length)
    r[0] = 'foo'
    assert.equal(1, a.length)
    assert.equal('foo', a[0])
    r.push('bar')
    assert.equal(2, a.length)
    assert.equal('bar', a[1])
  })

  it('should proxy indexed deletes to the target', function () {
    var a = [ 'foo' ]
      , r = weak(a)
    delete r[0]
    assert.equal('undefined', typeof a[0])
  })

  it('should proxy enumeration', function () {
    var o = { a: 'a', b: 'b', c: 'c', d: 'd' }
      , r = weak(o)
    assert.deepEqual(Object.keys(o), Object.keys(r))
  })

  it('should act like an empty object after target is gc\'d'
  , function () {
    var o = { foo: 'bar' }
      , r = weak(o)
    o = null
    assert.equal('bar', r.foo)
    gc()
    assert(!r.foo)
    assert.equal(0,Object.keys(r).length)
  })

})
