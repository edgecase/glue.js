var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('bindTo')
,   Glue = require(__dirname + "/../lib/glue");

suite.addBatch({
  "ensure change happens and listners are notified": {
    topic: new Glue({an: "object"}),

    "changes the glue instance's bound object": function(topic) {
      topic.bindTo({another: "object"});

      assert.deepEqual({another: "object"}, topic.target);
      assert.notDeepEqual({an: "object"}, topic.target);

    },

    "calls listners to boundObject when invoked": function(topic) {
      var callback1Invoked = false;
          callback2Invoked = false;

      topic.addListener(function() {
        callback1Invoked = true;
      }, "an");

      topic.addListener(function() {
        callback2Invoked = true;
      }, "target");

      topic.bindTo();

      assert.equal(callback1Invoked, false);
      assert.equal(callback2Invoked, true);
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(function(){});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
