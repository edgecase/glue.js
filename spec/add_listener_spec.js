var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('addListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "for non calculated or functional keypaths": {

    topic: new Glue({foo: "bar", baz: "zap"}),

    "can be assigned to an anonymous function": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener(hollaback);
      assert.deepEqual(topic.listeners, {
        '*': [
          {
            target: hollaback,
            hollaback: hollaback
          }
        ]
      });

      assert.deepEqual(topic.listenersCalcOrFunc, {});
    },

    "can be assigned to an object": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener({an: 'object'}, hollaback);
      assert.deepEqual(topic.listeners, {
        '*': [
          {
            target: {an: 'object'},
            hollaback: hollaback
          }
        ]
      });

      assert.deepEqual(topic.listenersCalcOrFunc, {});
    },

    "can be assigned to an anonymous function with a keypath": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener(hollaback, 'foo');

      assert.deepEqual(topic.listeners, {
        'foo': [
          {
            target: hollaback,
            hollaback: hollaback
          }
        ]
      });

      assert.deepEqual(topic.listenersCalcOrFunc, {});
    },

    "can be assigned to an object with a keypath": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener({an: 'object'}, 'foo', hollaback);

      assert.deepEqual(topic.listeners, {
        'foo': [
          {
            target: {an: 'object'},
            hollaback: hollaback
          }
        ]
      });

      assert.deepEqual(topic.listenersCalcOrFunc, {});
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(1, function(){});
      assert.equal(topic, returnedValue);
    }

  },


  "for calculated keyPaths": {

    topic: new Glue({
      internalArray: [],
    }),

    "can be assigned to an anonymous function": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener(hollaback, 'internalArray.(length)');

      assert.deepEqual(topic.listeners, {});
      assert.deepEqual(topic.listenersCalcOrFunc, {
        'internalArray.(length)': [
          {
            target: hollaback,
            hollaback: hollaback,
            oldValue: 0
          }
        ]
      });
    },

    "can be assigned to an object": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener({an: 'object'}, 'internalArray.(length)', hollaback);

      assert.deepEqual(topic.listeners, {});
      assert.deepEqual(topic.listenersCalcOrFunc, {
        'internalArray.(length)': [
          {
            target: {an: 'object'},
            hollaback: hollaback,
            oldValue: 0
          }
        ]
      });
    },

  },


  "for functional keyPaths": {

    topic: new Glue({
      internalArray: [],

      bar: function() {
        return this.internalArray.length;
      }
    }),

    "can be assigned to an anonymous function": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener(hollaback, 'bar()');

      assert.deepEqual(topic.listeners, {});
      assert.deepEqual(topic.listenersCalcOrFunc, {
        'bar()': [
          {
            target: hollaback,
            hollaback: hollaback,
            oldValue: 0
          }
        ]
      });
    },

    "can specify that a keypath is a function": function(topic) {
      topic.listeners = {};
      topic.listenersCalcOrFunc = {};

      var hollaback = function() {};

      topic.addListener({an: 'object'}, 'bar()', hollaback);

      assert.deepEqual(topic.listeners, {});
      assert.deepEqual(topic.listenersCalcOrFunc, {
        'bar()': [
          {
            target: {an: 'object'},
            hollaback: hollaback,
            oldValue: 0
          }
        ]
      });
    }

  }
});

suite.export(module);
