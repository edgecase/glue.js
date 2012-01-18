var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('get operation');

suite.addBatch({
  "target obj": {
    topic: new Glue([]),

    "get with empty key returns the target array": function(glue) {
      var target = [1,2,3,4];
      glue.target = target;

      var obj = glue.get('');

      assert.equal(obj, glue.target);
    },

    "get with empty key returns the target obj": function(glue) {
      var target = {v1: 'obj'};
      glue.target = target;

      var obj = glue.get('');

      assert.equal(obj, glue.target);
    }
  },

  "for assigned value": {
    topic: new Glue({}),

    "can be retrieved": function(glue) {
      glue.target = { v1: 'get this' };
      assert.equal(glue.get('v1'), 'get this');
    },

    "can be nested": function(glue) {
      glue.target = { v1: { v2: 'get this' }};
      assert.equal(glue.get('v1.v2'), 'get this');
    }
  },

  "for computed value": {
    topic: new Glue({}),

    "can be retrived": function(glue) {
      glue.target = { arr: [1] };
      assert.equal(glue.get('arr#length'), 1);
    },

    "can be nested": function(glue) {
      glue.target = { v1: {arr: [1]} };
      assert.equal(glue.get('v1.arr#length'), 1);
    }
  },

  "in arrays": {
    topic: new Glue([]),

    "for computed value": function(glue) {
      assert.equal(glue.get('#length'), 0);
    }
  },

  "alternate object": {
    topic: new Glue({v1: 'not this'}),

    "can be specified for a key": function(glue) {
      var obj = {v1: 'this one'};
      assert.equal(glue.get('v1', obj), 'this one');
    },

    "can be specified for an array": function(glue) {
      var obj = [1, 2, 3];
      assert.equal(glue.get('[1]', obj), 2);
    }
  },

  "normalizes keys": {
    topic: new Glue({}),

    "removes spaces on keys": function(glue) {
      glue.target = { v1: { v2: 1 }};
      assert.equal(glue.get('v1.         v2'), 1);
    }
  }
});

suite.export(module);
