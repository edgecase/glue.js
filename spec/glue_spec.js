var vows = require('vows')
,   util = require('util')
,   assert = require('assert')

,   suite = vows.describe('Glue private functions')
,   Glue = require("../lib/glue");

suite.addBatch({
  "set": {

    "simple assignment": function() {
      var topic = new Glue({level1: ''});

      topic.set('level1', 'top level');
      assert.equal(topic.boundObject.level1, "top level");
    },

    "nested assignment": function() {
      var topic = new Glue({level1: {level2: ''}});

      topic.set('level1.level2', 'two levels');
      assert.equal(topic.boundObject.level1.level2, "two levels");
    }
  },
});

suite.addBatch({
  "get": {

    "a singly nested property": function(topic) {
      var topic = new Glue({foo: 'bar'});

      assert.equal(topic.get("foo"), "bar");
    },

    "a doubly nested property": function(topic) {
      var topic = new Glue({foo: {bar: 'baz'}});

      assert.equal(topic.get("foo.bar"), "baz");
    }
  }
});


suite.addBatch({
  "getBoundObject": {
    topic: new Glue({foo: 1}),

    "returns a copy of the bound object": function(topic) {
      assert.deepEqual(topic.getBoundObject(), {foo: 1});
    },

    "manipulating object returned should not returned the actual bound object": function(topic) {
      var boundObject = topic.getBoundObject();

      boundObject.foo = 2;
      assert.deepEqual(topic.boundObject, {foo: 1});
      assert.notDeepEqual(topic.boundObject, {foo: 2});
    }
  }
});

suite.export(module);

