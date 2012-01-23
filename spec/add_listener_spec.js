var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('addListener');

// Assigns a listener for the target object. Listners can be assigned to 
// a key of the target object, and will be triggered when the value of that
// key is modified. Listeners that are not assigned to a key are invoked when
// any changes to the target object. This is identical to setting the
// listener to the any key '*' (see test cases for any key(*)).
//
// Usage:
// glue.addListener([key(s):operation(s)], [context], listener)
//
// key(s) (optional):
//  specifies when the listener function is to be invoked. Multiple keys
//  can be specified and are seperated by commas.
//
//  If a key is not specified the listner is assigned to '*' which is
//  executed when any changes occurs to the target object.
//
// operation(s) (optional):
//  only execute listener if the operation matches (ie: set, pop, filter, etc.)
//
// context (optional):
//  the context which listener is to be executed. By default
//  it is set to the target object
//
// listener:
//  the function that is to be invoked. The listener is passed a message
//  object that at minimum looks like this:
//
//  { operation: 'push', oldValue: 'bar', newValue: 'foo' }
//
//  Where operation is the name of the operation that caused that listener
//  to be invoked, newValue is the new value in the target object,
//  and oldValue is the previous value.
//
// Example
// var glue = new Glue ({ arr = [] })
//     obj  = {v1: ''};
//
// glue.addListener('arr:push,remove', obj, function(msg) {
//   this.v1 = msg.newValue;
// });
//
// This listener will be executed whenever a push or remove operation
// is performed on 'arr'. The scope of 'this' inside the listener function
// is obj. If this listener is executed the value obj.v1 will be msg.newValue.

suite.addBatch({
  "specific": {
    topic: new Glue({}),

    "implicitly assigned to any key": function(glue) {
      var callback = function(){};
      glue.resetListeners();
      glue.addListener(callback);

      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    },

    "assigned explicitly to any key with '*' key": function(glue) {
      var callback = function(){};
      glue.resetListeners();
      glue.addListener('*', callback);

      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: [],
        context: glue.target
      }]);
    },

    "implicitly assigned to any key along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener(':filter', callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: ['filter'],
        context: glue.target
      }]);
    },

    "implicitly assigned to any key along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener(':set,push', callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: ['set', 'push'],
        context: glue.target
      }]);
    },

    "implicitly assigned to any key along with context object": function(glue) {
      var callback = function(){}, contextObject = { a: 'context'};
      glue.resetListeners();

      glue.addListener(contextObject, callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: [],
        context: contextObject
      }]);
    },

    "explicitly assigned to any key along with context object": function(glue) {
      var callback = function(){}, contextObject = { a: 'context'};
      glue.resetListeners();

      glue.addListener('*', contextObject, callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: [],
        context: contextObject
      }]);
    },


    "implicitly assigned to any key with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener(':push', contextObject, callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: ['push'],
        context: contextObject
      }]);
    },

    "implicitly assigned to any key with multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener(':push, set', contextObject, callback);
      assert.deepEqual(glue.listeners.specific['*'], [{
        callback: callback,
        operations: ['push', 'set'],
        context: contextObject
      }]);
    },

    "assigned explicitly to a key": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1', callback);
      assert.deepEqual(glue.listeners.specific.v1, [{
        context: {},
        operations: [],
        callback: callback
      }]);
    },

    "assigned explicitly to a key along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1:set', callback);

      assert.deepEqual(glue.listeners.specific.v1, [{
        context: {},
        operations: ['set'],
        callback: callback
      }]);
    },

    "assigned explicitly to a key with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1:set, remove', callback);

      assert.deepEqual(glue.listeners.specific.v1, [{
        context: {},
        operations: ['set', 'remove'],
        callback: callback
      }]);
    },

    "assigned explicitly to a key with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1', contextObject, callback);
      assert.deepEqual(glue.listeners.specific.v1, [{
        callback: callback, operations: [], context: contextObject
      }]);
    },

    "assigned explicitly to multiple keys": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2', contextObject, callback);

      assert.deepEqual(glue.listeners.specific.v1, [{
        callback: callback, operations: [], context: contextObject
      }]);

      assert.deepEqual(glue.listeners.specific.v2, [{
        callback: callback, operations: [], context: contextObject
      }]);
    },

    "assigned with multile listeners on the same key": function(glue) {
      var callback1= function(){}
          callback2 = function(){};

      glue.resetListeners();

      glue.addListener('v1', callback1);
      glue.addListener('v1', callback2);

      assert.deepEqual(glue.listeners.specific.v1, [
        { context: {}, operations: [], callback: callback1 },
        { context: {}, operations: [], callback: callback2 }
      ]);
    }
  },

  "generic": {
    topic: new Glue([]),

    "generic key": function(glue) {
      var callback = function(){};

      glue.resetListeners();
      glue.addListener('[]', callback);

      glue.push(1);

      assert.deepEqual(glue.listeners.generic['[]'], [
        { context: [1], operations: [], callback: callback },
      ]);
    }
  }
});
suite.export(module);
