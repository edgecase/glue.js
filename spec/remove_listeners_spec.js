var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('removeListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "non calculated keyPaths": {
    topic: new Glue(),

    "removes all listeners if no arguments are passed": function(topic) {
      topic.listeners = {
        'foo': [
          { target: {my: "listener1"}, hollaback: function() {} },
        ]
      };

      topic.listenersCalcOrFunc = {
        'bar()': [
          { target: {my: "listener2"}, hollaback: function() {} },
        ]
      };

      topic.removeListener();

      assert.deepEqual(topic.listeners, {});
      assert.deepEqual(topic.listenersCalcOrFunc, {});
    },

    "removes non calculated keyPaths": function(topic) {
      var hollaback = function() {};

      topic.listeners = {
        'foo': [
          { target: {my: "listener"}, hollaback: hollaback },
        ],
        'bar': [
          { target: {my: "listener"}, hollaback: hollaback },
        ]
      };

      topic.removeListener("foo");

      assert.deepEqual(topic.listeners, {
        'bar': [
          { target: {my: "listener"}, hollaback: hollaback },
        ]
      });
    },

    "keypath hollaback pair": function(topic) {
      var hollaback1 = function() {},
          hollaback2 = function() {};

      topic.listeners = {
        'foo': [
          { target: {my: "listener1"}, hollaback: hollaback1 },
          { target: {my: "listener1"}, hollaback: hollaback2 },
        ],
        'bar': [
          { target: {my: "listener1"}, hollaback: hollaback1 }
        ]
      };

      topic.removeListener("foo", hollaback1);

      assert.deepEqual(topic.listeners, {
        'foo': [
          { target: {my: "listener1"}, hollaback: hollaback2 },
        ],
        'bar': [
          { target: {my: "listener1"}, hollaback: hollaback1 }
        ]
      });
    },

    "removes keyPath is no hollaback exists": function(topic) {
      var hollaback1 = function() {};

      topic.listeners = {
        'foo': [
          { target: {my: "listener1"}, hollaback: hollaback1 },
        ]
      };

      topic.removeListener("foo", hollaback1);

      assert.equal(topic.listeners.foo, undefined);
    }
  }
});

suite.export(module);
