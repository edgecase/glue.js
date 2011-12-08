var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('pushing to the target object');

suite.addBatch({
  "non nested": {
    topic: new Glue([]),

    "pushes an element into an array": function(topic) {
      topic.target = [];

      topic.push(1);
      assert.deepEqual(topic.target, [1]);
    },

    "notifies listeners to target": function(topic) {
      var message;

      topic.target = [];

      topic.addListener('target', function(msg) {
        message = msg;
      });

      topic.push(2);

      assert.deepEqual(message, {
          operation: "push"
        , newValue: 2
        , collection: [2]
        , length: 1
      });
    }
  },

  "nested arrays": {
    topic: new Glue({ arr: [] }),

    "can be push into with a keypath": function(topic) {
      topic.target = { arr: [] };

      topic.push('arr', 1);
      assert.deepEqual(topic.target.arr, [1]);
    },

    "can be push into arrays nested under other keys": function(topic) {
      topic.target = { v1: { arr: [] }};

      topic.push('v1.arr', 1);
      assert.deepEqual(topic.target.v1.arr, [1]);
    },

    "notifies listeners to target": function(topic) {
      var message;

      topic.target = { arr: [] };

      topic.addListener('arr', function(msg) {
        message = msg;
      });

      topic.push('arr', 2);

      assert.deepEqual(message, {
          operation: "push"
        , newValue: 2
        , collection: [2]
        , length: 1
      });
    }
  },

  callback: {
    "for array target object": function() {
      var topic = new Glue([]),
          message = { item: '', collection: ''};

      topic.push(1, function(collection, item) {
        message = [collection, item];
      });

      assert.deepEqual(message,  [[1], 1]);
    },

    "for nested array": function() {
    }
  },

  chainability: {
    topic: new Glue([]),

    "returns itself for chainalibility": function(topic) {
      var returnedValue = topic.push(1);
      assert.deepEqual(topic, returnedValue)
    }
  }
});

suite.export(module);


