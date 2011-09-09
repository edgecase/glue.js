var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('bindTo')
,   Glue = require("../lib/glue");

suite.addBatch({
  "ensure change happens and listners are notified": {
    topic: new Glue({an: "object"}),

    "changes the glue instance's bound object": function(topic) {
      topic.bindTo({another: "object"});

      assert.deepEqual({another: "object"}, topic.getBoundObject());
      assert.notDeepEqual({an: "object"}, topic.getBoundObject());

    },

    "calls listners to boundObject when invoked": function(topic) {
      var hollaback1Invoked = false;
          hollaback2Invoked = false;

      topic.addListener(function() {
        hollaback1Invoked = true;
      }, "an");

      topic.addListener(function() {
        hollaback2Invoked = true;
      }, "boundObject");

      topic.bindTo();

      assert.equal(hollaback1Invoked, false);
      assert.equal(hollaback2Invoked, true);
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(1, function(){});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
