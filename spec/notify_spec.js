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
    "notifies all listeners assigned to any key (*)": function(glue) {
      var glue = new Glue({v1: 1}),
          message1 = {},
          message2 = {};

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
        value: {v1: 2}
      });

      assert.deepEqual(message2, {
        operation: 'set',
        value: {v1: 2}
      });
    },

    "notifies listeners assigned to the key": function() {
      var glue = new Glue({v1: 1}),
          message  = {};

      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.set('v1', 2);

      assert.deepEqual(message, {
        operation: 'set',
        value: 2
      });
    },

    "notifies listeners that matches an operation": function() {
      var glue = new Glue({v1: 1}),
          message1 = {},
          message2 = {};

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
        value: 2
      });

      assert.deepEqual(message2, {});
    },

    "notifies generics": function() {
      var glue = new Glue([1]);
          message = {};

      glue.resetListeners();

      glue.addListener('[]', function(msg) {
        message = msg;
      });

      glue.set('[0]', 2);

      assert.deepEqual(message, {
        operation: 'set',
        index: 0,
        value: 2
      });
    },

    "notifies generics children": function() {
      var glue = new Glue([ { v1: { arr: [1, 2, 3] }} ]);
          messages= [];

      glue.resetListeners();

      glue.addListener('[0].v1.arr[]', function(msg) {
        messages.push(msg);
      });

      glue.set('[0]', { v1: { arr: [4, 5] }});

      assert.deepEqual(messages, [
        { value: 4, index: 0, operation: 'set' },
        { value: 5, index: 1, operation: 'set' },
        { value: undefined, index: 2, operation: 'set' }
      ]);
    }
  }
});

suite.export(module);
