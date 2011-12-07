var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('set')
,   Glue = require("../lib/glue");

suite.addBatch({
  "non collection": {
    topic: new Glue({level1: ''}),

    "simple assignment": function(topic) {
      topic.set('level1', 'top level');
      assert.equal(topic.target.level1, "top level");
    },

    "nested assignment": function() {
      var topic = new Glue({level1: {level2: ''}});

      topic.set('level1.level2', 'two levels');
      assert.equal(topic.target.level1.level2, "two levels");
    },

    "deeply nested assignment": function() {
      var topic = new Glue({level1: {level2: {level3: ''}}});

      topic.set('level1.level2.level3', 'three levels');
      assert.equal(topic.target.level1.level2.level3, "three levels");
    },

    "invocation returns itself for chainability": function(topic) {
      var returnedValue = topic.set('level1', 'top level');
      assert.equal(topic, returnedValue);
    }
  },
});


suite.addBatch({
  "arrays": {
    topic: new Glue([1,2,3]),

    "simple assignment": function(topic) {
      topic.set('[0]', 2);
      assert.equal(topic.target[0], 2);
    },

    "nested assignment": function() {
      var topic = new Glue({attr: {
        arr: [1, 2, 3]
      }});

      topic.set('attr[0]', 2);
      assert.equal(topic.target.attr[0], 2);
    },

    "assignment with index follow by a key": function() {
      var topic = new Glue({level1: {
        level2: [{nested1: 'not set'}, {nested2: 'not set'}]
      }});

      topic.set('level1.level2[0].nested1', 'setting');
      assert.equal(topic.target.level1.level2[0].nested1, 'setting');
    }
  },
});

suite.export(module);
