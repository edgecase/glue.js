var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('get method');

suite.addBatch({
  "assigned value": {
    topic: new Glue({}),

    "can be retrieved": function(topic) {
      topic.target = { v1: 'get this' };
      assert.equal(topic.get('v1'), 'get this');
    },

    "can be nested": function(topic) {
      topic.target = { v1: { v2: 'get this' }};
      assert.equal(topic.get('v1.v2'), 'get this');
    }
  },

  "computed value": {
    topic: new Glue({}),

    "can be retrived": function(topic) {
      topic.target = { arr: [1]};
      assert.equal(topic.get('arr#length'), 1);
    },

    "can be nested": function(topic) {
      topic.target = { v1: {arr: [1]} };
      assert.equal(topic.get('v1.arr#length'), 1);
    }
  },

  "normalizes keys": {
    topic: new Glue({}),

    "removes spaces on keys": function(topic) {
      topic.target = { v1: { v2: 1 }};
      assert.equal(topic.get('v1.         v2'), 1);
    }
  }
});

suite.export(module);

