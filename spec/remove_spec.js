var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('remove at index');

suite.addBatch({
  "non nested": {
    topic: new Glue([]),

    "removes from index": function(topic) {
      topic.target({arr: [1, 2, 3]});
      topic.removesAt(1);

      assert.deepEqual(topic.target, [1,3]);
    },

    "notifies listeners of collection": function(topic) {
      var message;

      topic.target({arr: [1, 2, 3]});
      topic.addListener("arr", function(msg) {
        message = msg;
      });

      topic.removesAt(1);
      assert.equal(message, {
        operation: "remove",

      });
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



