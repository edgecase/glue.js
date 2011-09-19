var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('set')
,   Glue = require("../lib/glue");

suite.addBatch({
  "in different levels of nesting": {
    topic: new Glue({level1: ''}),

    "simple assignment": function(topic) {
      topic.set('level1', 'top level');
      assert.equal(topic.boundObject.level1, "top level");
    },

    "nested assignment": function() {
      var topic = new Glue({level1: {level2: ''}});

      topic.set('level1.level2', 'two levels');
      assert.equal(topic.boundObject.level1.level2, "two levels");
    },

    "deeply nested assignment": function() {
      var topic = new Glue({level1: {level2: {level3: ''}}});

      topic.set('level1.level2.level3', 'three levels');
      assert.equal(topic.boundObject.level1.level2.level3, "three levels");
    },

    "invocation returns itself for chainability": function(topic) {
      var returnedValue = topic.set('level1', 'top level');
      assert.equal(topic, returnedValue);
    }
  },
});

suite.export(module);
