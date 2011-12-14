var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('removing from target obj');

suite.addBatch({
  "non collection": {
    topic: new Glue({}),

    "removes a key": function(topic) {
      topic.target = {v1: 'value'};
      topic.remove('v1');

      assert.equal(topic.target.v1, undefined);
    },

    "notifies listeners that the value has been removed": function(topic) {
      var message;

      topic.target = {v1: 'value'};

      topic.addListener('v1', function(msg) {
        message = msg;
      });

      topic.remove('v1');

      assert.deepEqual(message, {
          operation: 'remove'
        , oldValue: 'value'
      });
    }
  },

  "collection": {
    topic: new Glue([]),

    "removes from index": function(topic) {
      topic.target = [1, 2, 3];
      topic.remove('[1]');

      assert.deepEqual(topic.target, [1,3]);
    },

    // "notifies listeners of collection": function(topic) {
    //   var message;

    //   topic.target({arr: [1, 2, 3]});
    //   topic.addListener("arr", function(msg) {
    //     message = msg;
    //   });

    //   topic.removes(1);
    //   assert.equal(message, {
    //     operation: "remove",

    //   });
    // }
  }
});

suite.export(module);



