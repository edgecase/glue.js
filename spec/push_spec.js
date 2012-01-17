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

      topic.addListener('[]', function(msg) {
        message = msg;
      });

      topic.push(2);

      assert.deepEqual(message, {
        operation: 'push',
        currentIndex: 0,
        currentValue: 2
      });
    }
  },

  "nested arrays": {
    topic: new Glue({}),

    "can be push into with a key": function(topic) {
      topic.target = { arr: [] };

      topic.push('arr', 1);
      assert.deepEqual(topic.target.arr, [1]);
    },

    "can be push into arrays nested under other keys": function(topic) {
      topic.target = { v1: { arr: [] }};

      topic.push('v1.arr', 1);
      assert.deepEqual(topic.target.v1.arr, [1]);
    },

    "can be push into arrays nested under other keys": function(topic) {
      topic.target = { arr1: [ {arr2: [] }] };

      topic.push('arr1[0].arr2', 1);
      assert.deepEqual(topic.target, { arr1: [ {arr2: [1] }] });
    },

    "notifies listeners to target": function(topic) {
      var message;

      topic.target = { arr: [] };

      topic.addListener('arr', function(msg) {
        message = msg;
      });

      topic.push('arr', 2);

      assert.deepEqual(message, {
        oldValue: [],
        currentValue: [ 2 ],
        operation: 'push'
      });
    }
  },

  chainability: {
    topic: new Glue([]),

    "returns itself for chainalibility": function(glue) {
      var returnedValue = glue.push(1);
      assert.deepEqual(glue, returnedValue)
    }
  }
});

suite.export(module);

