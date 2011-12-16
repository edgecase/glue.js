var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('pop');

suite.addBatch({
  "target is array": {
    topic: new Glue([]),

    "pops target object is no argument is passed": function(topic) {
      topic.target = [1, 2];
      topic.pop();
      assert.deepEqual(topic.target, [1]);
    },

    "pops from arrays inside objects": function(topic) {
      topic.target = {arr: [1, 2]};
      topic.pop('arr');
      assert.deepEqual(topic.target, {arr: [1]});
    },

    "pops from arrays in nested objects": function(topic) {
      topic.target = {v1: { arr: [1, 2] }};
      topic.pop('v1.arr');
      assert.deepEqual(topic.target, {v1: {arr: [1]}});
    },

    "pops from arrays in nested objects": function(topic) {
      topic.target = {arr1: {arr2: [1, 2] }};

      topic.pop('arr1.arr2');
      assert.deepEqual(topic.target, {arr1: {arr2: [1] }});
    }
  },

  "notification": {
    topic: new Glue([1, 2]),

    "notifies with operation and oldValue": function(topic) {
      var message;

      topic.addListener(function(msg) {
        message = msg;
      });

      topic.pop();
      assert.deepEqual(message, { operation: 'pop', oldValue: 2});
    }
  },

  "returns": {
    topic: new Glue([]),

    "popped value": function(topic) {
      topic.target = [1, 2];
      assert.deepEqual(topic.pop(), 2);
    },
  }
});

suite.export(module);
