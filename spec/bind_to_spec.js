var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('bindTo')

suite.addBatch({
  "ensures": {
    topic: new Glue({}),

    "that the target object of glue is changed": function(topic) {
      topic.target = {};

      topic.bindTo({an: "object"});

      assert.notDeepEqual(topic.topic, {});
      assert.deepEqual(topic.target, {an: "object"});
    },

    "notifies listeners with the old and new target object": function(topic) {
      var message = {};

      topic.target = {};

      topic.addListener('target', function(msg) {
        message = msg;
      });

      topic.bindTo({ an: "object" });

      assert.deepEqual(message, {
          oldTarget: {}
        , newTarget: { an: "object" }
      });

      this.target = { an: "object" }; //reset
    },

    "executes a callback if available": function(topic) {
      var invoked = false;

      topic.target = {};

      topic.bindTo({an: "object"}, function() {
        invoked = true;
      });

      assert.equal(invoked, true);
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(function(){});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
