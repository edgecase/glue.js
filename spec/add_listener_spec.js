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
  "any key (*)": {
    topic: new Glue({}),

    "implicitly assigned": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener(callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: glue.target
      }]);
    },

    "assigned explicitly with '*' key": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('*', callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: glue.target
      }]);
    },

    "assigned along with operation restriction (implicit)": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener(':filter', callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: glue.target,
        operations: ['filter']
      }]);
    },

    "assigned along with operation restriction (explicit)": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('*:filter', callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: glue.target,
        operations: ['filter']
      }]);
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('*:set,push', callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: glue.target,
        operations: ['set', 'push']
      }]);
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*', contextObject, callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: contextObject
      }]);
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*:push', contextObject, callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: contextObject,
        operations: ['push']
      }]);
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*:push, set', contextObject, callback);
      assert.deepEqual(glue.listeners.any, [{
        callback: callback,
        context: contextObject,
        operations: ['push', 'set']
      }]);
    }
  },

  "assigned key (single)": {
    topic: new Glue({v1: ''}),

    "assigned to target object's attribute": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1', callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, context: glue.target }
      ]});
    },

    "assigned along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1:set', callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, operations: ['set'], context: glue.target}
      ]});
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1:set, remove', callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, operations: ['set', 'remove'], context: glue.target}
      ]});
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, context: contextObject }
      ]});
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1:set', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, context: contextObject, operations: ['set'] }
      ]});
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1:remove, set', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback, context: contextObject, operations: ['remove', 'set'] }
      ]});
    },

    "assigned with multile listeners on the same key": function(glue) {
      var callback1= function(){}
          callback2 = function(){};

      glue.resetListeners();

      glue.addListener('v1', callback1);
      glue.addListener('v1', callback2);

      assert.deepEqual(glue.listeners.assigned, {v1: [
        { callback: callback1, context: glue.target},
        { callback: callback2, context: glue.target}
      ]});
    }
  },

    "assigned key (multiple)": {
    topic: new Glue({v1: '', v2: ''}),

    "assigned to target object's attribute": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2', callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, context: glue.target }],
        v2: [{ callback: callback, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2:set', callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, operations: ['set'], context: glue.target }],
        v2: [{ callback: callback, operations: ['set'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2:set, remove', callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, operations: ['set', 'remove'], context: glue.target }],
        v2: [{ callback: callback, operations: ['set', 'remove'], context: glue.target }],
      });
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, context: contextObject }],
        v2: [{ callback: callback, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2:set', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, context: contextObject, operations: ['set'] }],
        v2: [{ callback: callback, context: contextObject, operations: ['set'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2:remove, set', contextObject, callback);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ callback: callback, context: contextObject, operations: ['remove', 'set'] }],
        v2: [{ callback: callback, context: contextObject, operations: ['remove', 'set'] }]
      });
    }
  },

  "calculated key (single)": {
    topic: new Glue({arr: []}),

    "assigned to target object's attribute": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr#length', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [{ callback: callback, oldValue: 0, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr#length:filter', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { callback: callback, oldValue: 0, context: glue.target, operations: ['filter'] }
        ]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr#length:filter, push', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { callback: callback, oldValue: 0, context: glue.target, operations: ['filter', 'push'] }
        ]
      });
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { callback: callback, oldValue: 0, context: contextObject }
        ]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length:push', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { callback: callback, oldValue: 0, context: contextObject, operations: ['push'] }
        ]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length:push, set', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        "arr#length": [
          { callback: callback, oldValue: 0, context: contextObject, operations: ['push', 'set'] }
        ]
      });
    },

    "assigned with multile listeners on the same key": function(glue) {
      var callback1 = function(){}
          callback2 = function(){};

      glue.resetListeners();

      glue.addListener('arr#length', callback1);
      glue.addListener('arr#length', callback2);

      assert.deepEqual(glue.listeners.computed, {'arr#length': [
        { callback: callback1, oldValue: 0, context: glue.target},
        { callback: callback2, oldValue: 0, context: glue.target}
      ]});
    }
  },

  "calculated key (multiple)": {
    topic: new Glue({arr1: [], arr2: []}),

    "assigned to target object's attribute": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ callback: callback, oldValue: 0, context: glue.target }],
        'arr2#length': [{ callback: callback, oldValue: 0, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:filter', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ callback: callback, oldValue: 0, operations: ['filter'], context: glue.target }],
        'arr2#length': [{ callback: callback, oldValue: 0, operations: ['filter'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:filter, push', callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ callback: callback, oldValue: 0, operations: ['filter', 'push'], context: glue.target }],
        'arr2#length': [{ callback: callback, oldValue: 0, operations: ['filter', 'push'], context: glue.target }]
      });
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ callback: callback, oldValue: 0, context: contextObject }],
        'arr2#length': [{ callback: callback, oldValue: 0, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:push', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push'] }],
        'arr2#length': [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:push, set', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        "arr1#length": [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push', 'set'] }],
        "arr2#length": [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push', 'set'] }]
      });
    }
  },

  "calculated key for array target object (single)": {
    topic: new Glue([]),

    "assigned to target object's attribute": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('#length', callback);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ callback: callback, oldValue: 0, context: glue.target}]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('#length:filter', callback);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ callback: callback, oldValue: 0, operations: ['filter'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var callback = function(){};
      glue.resetListeners();

      glue.addListener('#length:filter, push', callback);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ callback: callback, oldValue: 0, operations: ['filter', 'push'], context: glue.target }]
      });
    },

    "assigned with a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ callback: callback, oldValue: 0, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length:push', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var callback = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length:push, set', contextObject, callback);
      assert.deepEqual(glue.listeners.computed, {
        "#length": [{ callback: callback, oldValue: 0, context: contextObject, operations: ['push', 'set'] }]
      });
    }
  }
});
suite.export(module);
