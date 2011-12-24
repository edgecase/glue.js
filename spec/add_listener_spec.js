var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('addListener');

// Assigns a listner to the target object. Keys are optional. Listners that
// do not have keys assign are invoked on any changes to the target object.
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
//  { operation: 'push', oldValue: 'bar', newValue: 'foo'}
//
//  Where operation is the name of the operation that caused that listener
//  to be invoked, newValue is the new value in the target object,
//  and oldValue is the previous value.
//
// Examples
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
      var listener = function(){};
      glue.resetListeners();

      glue.addListener(listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: glue.target
      }]);
    },

    "assigned explicitly with '*' key": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('*', listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: glue.target
      }]);
    },

    "assigned along with operation restriction (implicit)": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener(':filter', listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: glue.target,
        operations: ['filter']
      }]);
    },

    "assigned along with operation restriction (explicit)": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('*:filter', listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: glue.target,
        operations: ['filter']
      }]);
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('*:set,push', listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: glue.target,
        operations: ['set', 'push']
      }]);
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*', contextObject, listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: contextObject
      }]);
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*:push', contextObject, listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: contextObject,
        operations: ['push']
      }]);
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('*:push, set', contextObject, listener);
      assert.deepEqual(glue.listeners.any, [{
        listener: listener,
        context: contextObject,
        operations: ['push', 'set']
      }]);
    }
  },

  "assigned key (single)": {
    topic: new Glue({v1: ''}),

    "assigned to target object's attribute": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1', listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, context: glue.target }
      ]});
    },

    "assigned along with operation restriction": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1:set', listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, operations: ['set'], context: glue.target}
      ]});
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1:set, remove', listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, operations: ['set', 'remove'], context: glue.target}
      ]});
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, context: contextObject }
      ]});
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1:set', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, context: contextObject, operations: ['set'] }
      ]});
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1:remove, set', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener, context: contextObject, operations: ['remove', 'set'] }
      ]});
    },

    "assigned with multile listeners on the same key": function(glue) {
      var listener1 = function(){}
          listener2 = function(){};

      glue.resetListeners();

      glue.addListener('v1', listener1);
      glue.addListener('v1', listener2);

      assert.deepEqual(glue.listeners.assigned, {v1: [
        { listener: listener1, context: glue.target},
        { listener: listener2, context: glue.target}
      ]});
    }
  },

    "assigned key (multiple)": {
    topic: new Glue({v1: '', v2: ''}),

    "assigned to target object's attribute": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2', listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, context: glue.target }],
        v2: [{ listener: listener, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2:set', listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, operations: ['set'], context: glue.target }],
        v2: [{ listener: listener, operations: ['set'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('v1, v2:set, remove', listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, operations: ['set', 'remove'], context: glue.target }],
        v2: [{ listener: listener, operations: ['set', 'remove'], context: glue.target }],
      });
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, context: contextObject }],
        v2: [{ listener: listener, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2:set', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, context: contextObject, operations: ['set'] }],
        v2: [{ listener: listener, context: contextObject, operations: ['set'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('v1, v2:remove, set', contextObject, listener);
      assert.deepEqual(glue.listeners.assigned, {
        v1: [{ listener: listener, context: contextObject, operations: ['remove', 'set'] }],
        v2: [{ listener: listener, context: contextObject, operations: ['remove', 'set'] }]
      });
    }
  },

  "calculated key (single)": {
    topic: new Glue({arr: []}),

    "assigned to target object's attribute": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr#length', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [{ listener: listener, oldValue: 0, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr#length:filter', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { listener: listener, oldValue: 0, context: glue.target, operations: ['filter'] }
        ]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr#length:filter, push', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { listener: listener, oldValue: 0, context: glue.target, operations: ['filter', 'push'] }
        ]
      });
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { listener: listener, oldValue: 0, context: contextObject }
        ]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length:push', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr#length': [
          { listener: listener, oldValue: 0, context: contextObject, operations: ['push'] }
        ]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr#length:push, set', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        "arr#length": [
          { listener: listener, oldValue: 0, context: contextObject, operations: ['push', 'set'] }
        ]
      });
    },

    "assigned with multile listeners on the same key": function(glue) {
      var listener1 = function(){}
          listener2 = function(){};

      glue.resetListeners();

      glue.addListener('arr#length', listener1);
      glue.addListener('arr#length', listener2);

      assert.deepEqual(glue.listeners.computed, {'arr#length': [
        { listener: listener1, oldValue: 0, context: glue.target},
        { listener: listener2, oldValue: 0, context: glue.target}
      ]});
    }
  },

  "calculated key (multiple)": {
    topic: new Glue({arr1: [], arr2: []}),

    "assigned to target object's attribute": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ listener: listener, oldValue: 0, context: glue.target }],
        'arr2#length': [{ listener: listener, oldValue: 0, context: glue.target }]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:filter', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ listener: listener, oldValue: 0, operations: ['filter'], context: glue.target }],
        'arr2#length': [{ listener: listener, oldValue: 0, operations: ['filter'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:filter, push', listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ listener: listener, oldValue: 0, operations: ['filter', 'push'], context: glue.target }],
        'arr2#length': [{ listener: listener, oldValue: 0, operations: ['filter', 'push'], context: glue.target }]
      });
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ listener: listener, oldValue: 0, context: contextObject }],
        'arr2#length': [{ listener: listener, oldValue: 0, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:push', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        'arr1#length': [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push'] }],
        'arr2#length': [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('arr1#length, arr2#length:push, set', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        "arr1#length": [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push', 'set'] }],
        "arr2#length": [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push', 'set'] }]
      });
    }
  },

  "calculated key for array target object (single)": {
    topic: new Glue([]),

    "assigned to target object's attribute": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('#length', listener);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ listener: listener, oldValue: 0, context: glue.target}]
      });
    },

    "assigned along with operation restriction": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('#length:filter', listener);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ listener: listener, oldValue: 0, operations: ['filter'], context: glue.target }]
      });
    },

    "assigned along with multiple operation restrictions": function(glue) {
      var listener = function(){};
      glue.resetListeners();

      glue.addListener('#length:filter, push', listener);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ listener: listener, oldValue: 0, operations: ['filter', 'push'], context: glue.target }]
      });
    },

    "assigned with a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ listener: listener, oldValue: 0, context: contextObject }]
      });
    },

    "assigned with an operation and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length:push', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        '#length': [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push'] }]
      });
    },

    "assigned with an multiple operations and a context object": function(glue) {
      var listener = function(){}, contextObject = {};
      glue.resetListeners();

      glue.addListener('#length:push, set', contextObject, listener);
      assert.deepEqual(glue.listeners.computed, {
        "#length": [{ listener: listener, oldValue: 0, context: contextObject, operations: ['push', 'set'] }]
      });
    }
  }
});
suite.export(module);
