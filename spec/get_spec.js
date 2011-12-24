var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('get operation');

suite.addBatch({
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

  "normalizes keys": {
    topic: new Glue({}),

    "removes spaces on keys": function(glue) {
      glue.target = { v1: { v2: 1 }};
      assert.equal(glue.get('v1.         v2'), 1);
    }
  }
});

suite.export(module);


