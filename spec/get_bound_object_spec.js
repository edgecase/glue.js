var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('getBoundObject')
,   Glue = require("../lib/glue");

suite.addBatch({
  "checking boundObject safety": {
    topic: new Glue({foo: 1}),

    "returns a copy of the bound object": function(topic) {
      assert.deepEqual(topic.getBoundObject(), {foo: 1});
    },

    "manipulating object returned should not returned the actual bound object": function(topic) {
      var boundObject = topic.getBoundObject();

      boundObject.foo = 2;
      assert.deepEqual(topic.getBoundObject(), {foo: 1});
      assert.notDeepEqual(topic.getBoundObject(), {foo: 2});
    }
  }
});

suite.export(module);
