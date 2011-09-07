var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('bindTo')
,   Glue = require("../lib/glue");

suite.addBatch({
  "ensure change happens and listners are notified": {
    topic: new Glue({an: "object"}),

    "changes the glue instance's bound object": function(topic) {
      topic.bindTo({another: "object"});

      assert.deepEqual({another: "object"}, topic.boundObject);
      assert.notDeepEqual({an: "object"}, topic.boundObject);

    },

    "calls listners to boundObject when invoked": function(topic) {
      var oldObject = topic.boundObject,
          notify = topic.notify;


      topic.notify = function() {
        assert.equal(arguments[0], "boundObject");
        assert.deepEqual(arguments[1], {
          oldValue: oldObject,
          value: topic.boundObject
        });
      };

      topic.bindTo();
      topic.notify = notify;
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(1, function(){});
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
