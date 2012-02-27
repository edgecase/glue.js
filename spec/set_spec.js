var vows   = require('vows')
,   assert = require('assert')

,   suite  = vows.describe('Setting value to a specific key')
,   Glue   = require(__dirname + "/../lib/glue");

suite.addBatch({
  "non collection": {
    topic: new Glue({v1: ''}),

    "simple assignment": function(topic) {
      topic.set('v1', 'foo');
      assert.equal(topic.target.v1, "foo");
    },

    "nested assignment": function() {
      var topic = new Glue({v1: {v2: ''}});

      topic.set('v1.v2', 'foo');
      assert.equal(topic.target.v1.v2, "foo");
    },

    "deeply nested assignment": function() {
      var topic = new Glue({v1: {v2: {v3: ''}}});

      topic.set('v1.v2.v3', 'foo');
      assert.equal(topic.target.v1.v2.v3, "foo");
    }
  },

  "non-existent key": {
    topic: new Glue({}),

    "are created if it does not exist": function(topic) {
      topic.set('v1', 'foo');
      assert.deepEqual(topic.target, {v1: 'foo'});
    }
  },

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
    }
  },

  "array and hash": {
    topic: new Glue({level1: { level2: [{nested1: 'not set'}, {nested2: 'not set'}]}}),

    "assignment with index follow by a key": function(topic) {
      topic.set('level1.level2[0].nested1', 'setting');
      assert.equal(topic.target.level1.level2[0].nested1, 'setting');
    }
  },

  "chainability": {
    topic: new Glue({}),

    "invoking set returns itself for chainability": function(topic) {
      var returnedValue = topic.set('v1', 'foo');
      assert.equal(topic, returnedValue);
    }
  },

  "notification": {
    topic: new Glue({v1: "foo"}),

    "notifies listeners with the new and old value": function(topic) {
      var message = [];

      topic.addObserver("v1", function(msg) {
        message = msg;
      });

      topic.set("v1", "bar");

      assert.deepEqual(message, {
        value: 'bar',
        operation: 'set'
      });
    }
  }
});

suite.export(module);
