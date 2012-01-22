var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('notification system');


// Not in the public API.
//
// This is the method which invokes the appropriate listener(s)
// when Glue modifies the target object.
//
// Usage:
// glue.notify(key, operation, original, current, changes);
//
// key:
//   specifies the key which has been altered by Glue
//
// operation:
//   the operation responsible for calling notify
//
// changes:
//   an array allows notify to figure out how the target object
//   has changed

suite.addBatch({
  "assigned (non-nested)": {
    topic: new Glue({}),

    "notifies all listeners assigned to any key (*)": function(glue) {
      var message1 = {},
          message2 = {};

      glue.target = {v1: 1};
      glue.resetListeners();

      glue.addListener(function(msg) {
        message1 = msg;
      });

      glue.addListener(function(msg) {
        message2 = msg;
      });

      glue.set('v1', 2);

      assert.deepEqual(message1, {
        operation: 'set',
        oldValue: {v1: 1},
        currentValue: {v1: 2}
      });

      assert.deepEqual(message2, {
        operation: 'set',
        oldValue: {v1: 1},
        currentValue: {v1: 2}
      });
    },

    "notifies listeners assigned to the key": function(glue) {
      var message  = {};

      glue.target = {v1: 1};
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.set('v1', 2);

      assert.deepEqual(message, {
        operation: 'set',
        oldValue: 1,
        currentValue: 2
      });
    },

    "notifies listeners that matches an operation": function(glue) {
      var message1 = {},
          message2 = {};

      glue.target = {v1: 1};
      glue.resetListeners();

      glue.addListener('v1:set', function(msg) {
        message1 = msg;
      });

      glue.addListener('v1:push', function(msg) {
        message2 = msg;
      });

      glue.set('v1', 2);

      assert.deepEqual(message1, {
        operation: 'set',
        oldValue: 1,
        currentValue: 2
      });

      assert.deepEqual(message2, {});
    },

    "notifies generics": function(glue) {
      var message = {};

      glue.target = [1];
      glue.resetListeners();

      glue.addListener('[]', function(msg) {
        message = msg;
      });

      glue.set('[0]', 2);

      assert.deepEqual(message, {
        operation: 'set',
        index: 0,
        oldValue: 1,
        currentValue: 2
      });
    }
  }
});

suite.export(module);
