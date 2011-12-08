var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('bindTo')
,   Glue = require(__dirname + "/../lib/glue");

suite.addBatch({
  "ensures": {
    "that the target object of glue is changed": function() {
      var topic = new Glue({an: "object"});

      topic.bindTo({another: "object"});

      assert.notDeepEqual(topic.topic, {an: "object"});
      assert.deepEqual(topic.target, {another: "object"});
    },

    "notifies listeners with the old and new target object": function() {
      var topic = new Glue({an: "object"})
        , message = {};

      topic.addListener('target', function(msg) {
        message = msg;
      });

      topic.bindTo({ another: "object" });

      assert.deepEqual(message, {
          oldTarget: { an: "object" }
        , newTarget: { another: "object" }
      });

      this.target = { an: "object" }; //reset
    },

    "executes a callback if available": function() {
      var topic = new Glue({an: "object"})
        , invoked = false;

      topic.bindTo({}, function() {
        invoked = true;
      });

      assert.equal(invoked, true);
    },

    "when invoked, returns itself for chainability": function() {
      var topic = new Glue({an: "object"});

      var returnedValue = topic.addListener(function(){});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
