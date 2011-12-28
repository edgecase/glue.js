var vows = require('vows')
,   _ = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('removeListener');

// Removes listener for a specific key/operation combination or context object
//
// Usage:
// glue.removeListener((key(s):operation(s)), [context]);
//
// key(s) (optional):
//
// operations(s) (optional):
//
// context (optional):
//
// Examples
// glue.removeListener('v1')
// glue.removeListener(':set')
// glue.removeListener('set:pop')
// glue.removeListener(obj)
// glue.removeListener(arr, obj)
// glue.removeListener(arr:pop, obj)

suite.addBatch({
  "by key (*)": {
    topic: new Glue({v1: ''}),

    "removes all (implicit)": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener();
      assert.deepEqual(glue.listeners, { any: [], assigned: {}, computed: {} });
    },

    "removes all (explicit)": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('*');
      assert.deepEqual(glue.listeners, { any: [], assigned: {}, computed: {} });
    }
  },

  "by key (assigned)": {
    topic: new Glue({v1: ''}),

    "removes only the specified key": function(glue) {
      glue.listeners = mockListeners(glue);
      glue.removeListener('v1');

      var expected = mockListeners(glue);
      delete expected.assigned['v1'];

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by keys (assigned)": {
    topic: new Glue({v1: '', v2: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1, v2');

      var expected = mockListeners(glue);
      delete expected.assigned['v1'];
      delete expected.assigned['v2'];

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key (computed)": {
    topic: new Glue({v1: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1#length');

      var expected = mockListeners(glue);
      delete expected.computed['v1#length'];

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by keys (computed)": {
    topic: new Glue({v1: '', v2: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1#length, v2#length');

      var expected = mockListeners(glue);
      delete expected.computed['v1#length'];
      delete expected.computed['v2#length'];

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key and operation (*)": {
    topic: new Glue({v1: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('*:set');

      var expected = mockListeners(glue);
      expected.any.splice(1,1);

      expected.assigned.v1[2].operations.splice(1,1);
      expected.assigned.v1.splice(0,1);
      expected.assigned.v2.splice(1,1);

      delete expected.computed['v2#length']
      delete expected.computed['v1#length'][2].operations.splice(1,1)
      delete expected.computed['v1#length'].splice(1,1)

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key and operation (assigned)": {
    topic: new Glue({v1: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1:set');

      var expected = mockListeners(glue);

      expected.assigned['v1'][2].operations.splice(1,1);
      expected.assigned['v1'].splice(0,1);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    },

    "removes operation but keeps listener if a listener has more than one operation": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1:filter');

      var expected = mockListeners(glue);
      expected.assigned['v1'][2].operations.splice(0,1);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by keys and operations (assigned)": {
    topic: new Glue({v1: '', v2: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1, v2:set');

      var expected = mockListeners(glue);
      expected.assigned['v1'][2].operations.splice(1,1);
      expected.assigned['v1'].splice(0,1);
      expected.assigned['v2'].splice(1,1);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key and operation (computed)": {
    topic: new Glue({v1: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1#length:filter');

      var expected = mockListeners(glue);
      expected.computed['v1#length'][2].operations.splice(0,1);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    },

    "removes operation but keeps listener if a listener has more than one operation": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1#length:filter');

      var expected = mockListeners(glue);
      expected.computed['v1#length'][2].operations.splice(0,1);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by keys and operations (computed)": {
    topic: new Glue({v1: '', v2: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener('v1#length, v2#length:set');

      var expected = mockListeners(glue);
      expected.computed['v1#length'][2].operations.splice(1,1);
      expected.computed['v1#length'].splice(1,1);
      delete expected.computed['v2#length'];

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "context object": {
    topic: new Glue({v1: ''}),

    "removes specified keys": function(glue) {
      glue.listeners = mockListeners(glue);

      glue.removeListener(glue.target);
      assert.deepEqual(glue.listeners, { any: [], assigned: {}, computed: {} });
    }
  },

  "by key, operation, and context object (*)": {
    topic: new Glue({v1: ''}),

    "": function(glue) {
      glue.listeners = mockListeners(glue);

      var expected = mockListeners(glue);
      expected.any.splice(1,1);

      expected.assigned.v1[2].operations.splice(1,1);
      expected.assigned.v1.splice(0,1);

      delete expected.computed['v2#length'];
      expected.computed['v1#length'][2].operations.splice(1,1);
      expected.computed['v1#length'].splice(1,1);

      expected.assigned.v2.splice(1,1);

      glue.removeListener('*:set', glue.target);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key, operation, and context object (assigned)": {
    topic: new Glue({v1: ''}),

    "": function(glue) {
      glue.listeners = mockListeners(glue);

      var expected = mockListeners(glue);
      expected.assigned['v1'][2].operations.splice(1,1);
      expected.assigned['v1'].splice(0,1);

      glue.removeListener('v1:set', glue.target);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  },

  "by key, operation, and context object (computed)": {
    topic: new Glue({v1: ''}),

    "": function(glue) {
      glue.listeners = mockListeners(glue);

      var expected = mockListeners(glue);
      expected.computed['v1#length'][2].operations.splice(1,1);
      expected.computed['v1#length'].splice(1,1);

      glue.removeListener('v1#length:set', glue.target);

      assert.deepEqual(glue.listeners.any, expected.any);
      assert.deepEqual(glue.listeners.assigned, expected.assigned);
      assert.deepEqual(glue.listeners.computed, expected.computed);
    }
  }
});

function mockListeners(glue) {
  return {
    any: [
      { listener: "listener", context: glue.target },
      { listener: "listener", context: glue.target, operations: ['set'] }
    ],

    assigned: {
      v1: [
        { listener: "listener", context: glue.target, operations: ['set'] },
        { listener: "listener", context: glue.target, operations: ['push'] },
        { listener: "listener", context: glue.target, operations: ['filter', 'set'] }
      ],
      v2: [
        { listener: "listener", context: glue.target },
        { listener: "listener", context: glue.target, operations: ['set'] }
      ]
    },

    computed: {
      'v1#length': [
        { listener: "listener", context: glue.target, oldValue: 0 },
        { listener: "listener", context: glue.target, oldValue: 0, operations: ['set'] },
        { listener: "listener", context: glue.target, oldValue: 0, operations: ['filter', 'set'] }
      ],
      'v2#length': [{ listener: "listener", context: glue.target, oldValue: 0, operations: ['set'] }]
    }
  };
}

suite.export(module)
