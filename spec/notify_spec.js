var vows   = require('vows')
,   assert = require('assert')
,   _      = require('underscore')
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
    topic: new Glue({ v1: 1 }),

    "notifies all listeners assigned to any key (*)": function(glue) {
      var message1 = {}, message2 = {},
          original = { v1: 1 },
          current  = { v1: 2 };

      glue.target = current;
      glue.resetListeners();

      glue.addListener(function(msg) {
        message1 = msg;
      });

      glue.addListener(function(msg) {
        message2 = msg;
      });

      glue.notify('v1', 'set', original, current, {
        'v1': { value: { old: 1, current: 2 }}
      });

      assert.deepEqual(message1, {
        key: 'v1',
        operation: 'set',
        oldValue: original,
        currentValue: current,
        changes: { 'v1':
          { value: { old: 1, current: 2 }}
        }
      });

      assert.deepEqual(message2, {
        key: 'v1',
        operation: 'set',
        oldValue: original,
        currentValue: current,
        changes: { 'v1':
          { value: { old: 1, current: 2 }}
        }
      });
    },

    "notifies listeners assigned to the key": function(glue) {
      var message  = {}
          original = { v1: 1 },
          current  = { v1: 2 };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('v1', 'set', original, current, {
        'v1': { value: { old: 1, current: 2 } }
      });

      assert.deepEqual(message, {
        key: 'v1',
        operation: 'set',
        oldValue: 1,
        currentValue: 2,
        changes: { 'v1':
          { value: { old: 1, current: 2 }}
        }
      });
    },

    "notifies listeners that matches an opeartion": function(glue) {
      var message1 = {},
          message2 = {},
          original = { v1: 1 },
          current  = { v1: 2 };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1:set', function(msg) {
        message1 = msg;
      });

      glue.addListener('v1:push', function(msg) {
        message2 = msg;
      });

      glue.notify('v1', 'set', original, current, {
        'v1': { value: { old: 1, current: 2 } }
      });

      assert.deepEqual(message1, {
        key: 'v1',
        operation: 'set',
        oldValue: 1,
        currentValue: 2,
        changes: { 'v1':
          { value: { old: 1, current: 2 }}
        }
      });

      assert.deepEqual(message2, {});
    }
  },

  "array (non-nested)" : {
    topic: new Glue([1, 2, 3]),

    "notify at an element level": function(glue) {
      var message  = {},
          original = [1, 2, 3],
          current  = [1, 2, 3, 1];

      glue.target = current;
      glue.resetListeners();

      glue.addListener('[]', function(msg) {
        message = msg;
      });

      glue.notify('[3]', 'push', original, current, [
        { index: { current: '[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: '[3]',
        operation: 'push',
        index: 3,
        currentValue: 1,
        changes: [{ index: { current: '[3]' }, value: { current : 1 } }]
      });
    },

    "notify at that index": function(glue) {
      var message = {},
          original = [1, 2, 3],
          current  = [1, 2, 3, 1];

      glue.target = current;
      glue.resetListeners();

      glue.addListener('[3]', function(msg) {
        message = msg;
      });

      glue.notify('[3]', 'push', original, current, [
        { index: { current: '[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: '[3]',
        operation: 'push',
        index: 3,
        currentValue: 1,
        changes: [{ index: { current: '[3]' }, value: { current : 1 } }]
      });
    },

    "notify at the collection level": function(glue) {
      var message = {},
          original = [1, 2, 3],
          current  = [1, 2, 3, 1];

      glue.target = current;
      glue.resetListeners();

      glue.addListener(function(msg) {
        message = msg;
      });

      glue.notify('[3]', 'push', original, current, [
        { index: { current: '[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: '[3]',
        operation: 'push',
        oldValue: original,
        currentValue: current,
        changes: [{ index: { current: '[3]' }, value: { current : 1 } }]
      });
    }
  },

  "array (nested)": {
    topic: new Glue({ arr: [1, 2, 3] }),

    "notifies on an element level": function(glue) {
      var message  = {},
          original = { arr: [1, 2, 3] },
          current  = { arr: [1, 2, 3, 1] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[]', function(msg) {
        message = msg;
      });

      glue.notify('arr[3]', 'push', original, current, [
        { index: { current: 'arr[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: 'arr[3]',
        operation: 'push',
        index: 3,
        currentValue: 1,
        changes: [{ index: { current: 'arr[3]' }, value: { current: 1 } }]
      });
    },

    "notifies listeners at an index": function(glue) {
      var message  = {},
          original = { arr: [1, 2, 3] },
          current  = { arr: [1, 2, 3, 1] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[3]', function(msg) {
        message = msg;
      });

      glue.notify('arr[3]', 'push', original, current, [
        { index: { current: 'arr[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: 'arr[3]',
        operation: 'push',
        index: 3,
        currentValue: 1,
        changes: [{ index: { current: 'arr[3]' }, value: { current: 1 } }]
      });
    },

    "notifies on the collection level": function(glue) {
      var message  = {},
          original = { arr: [1, 2, 3] },
          current  = { arr: [1, 2, 3, 1] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr', function(msg) {
        message = msg;
      });

      glue.notify('arr[3]', 'push', original, current, [
        { index: { current: 'arr[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: 'arr[3]',
        operation: 'push',
        oldValue: [1, 2, 3],
        currentValue: [1, 2, 3, 1],
        changes: [{ index: { current: 'arr[3]' }, value: { current: 1 } }]
      });
    },

    "notifies listeners to any key (*)": function(glue) {
      var message  = {},
          original = { arr: [1, 2, 3] },
          current  = { arr: [1, 2, 3, 1] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener(function(msg) {
        message = msg;
      });

      glue.notify('arr[3]', 'push', original, current, [
        { index: { current: 'arr[3]' }, value: {  current: 1 } }
      ]);

      assert.deepEqual(message, {
        key: 'arr[3]',
        operation: 'push',
        oldValue: { arr: [1, 2, 3] },
        currentValue: { arr: [1, 2, 3, 1] },
        changes: [ { index: { current: 'arr[3]' }, value: {  current: 1 } } ]
      });
    }
  },

  "assigned (nested)": {
    topic: new Glue({ v1: { v2: '' }}),

    "invokes listeners of that key": function(glue) {
      var message  = {},
          original = { v1: { v2: '' }},
          current  = { v1: { v2: 'a value' }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2', function(msg) {
        message = msg;
      });

      glue.notify('v1.v2', 'set', original, current, { 'v1.v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        key: 'v1.v2',
        operation: 'set',
        oldValue: '',
        currentValue: 'a value',
        changes: { 'v1.v2' :
          { value: { old: '' , current: 'a value' }}
        }
      });
    },

    "invokes listeners to any key": function(glue) {
      var message  = {},
          original = { v1: { v2: '' }},
          current  = { v1: { v2: 'a value' }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener(function(msg) {
        message = msg;
      });

      glue.notify('v1.v2', 'set', original, current, { 'v1.v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        key: 'v1.v2',
        operation: 'set',
        oldValue: { v1: { v2: '' }},
        currentValue: {v1: { v2: 'a value' }},
        changes: { 'v1.v2' :
          { value: { old: '' , current: 'a value' }}
        }
      });
    },

    "only invokes any listener once per notification even (*)": function(glue) {
      var invocations = [],
          original    = { v1: { v2: '' }},
          current     = { v1: { v2: 'a value' }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener(function() {
        invocations.push(1);
      });

      glue.notify('v1.v2', 'set', original, current, { 'v1.v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(invocations, [1]);
    },
  },

  "assigned and array combination (nested)": {
    topic: new Glue({ v1: { arr: [1, 2, 3] }}),

    "notified in an element level": function(glue) {
      var message  = {};
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[]', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[3]', 'push', original, current, [
        { index: { current: 'v1.arr[3]' }, value: { current: 4 } }
      ]);

      assert.deepEqual(message, {
        key: 'v1.arr[3]',
        index: 3,
        currentValue: 4,
        operation: 'push',
        changes: [{
          index: { current: 'v1.arr[3]' },
          value: { current: 4 }
        }]
      });
    },

    "notifies listener at an index": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = { v1: { arr: [1, 2, 3] }};
      glue.resetListeners();

      glue.addListener('v1.arr[3]', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[3]', 'push', original, current, [
        { index: { current: 'v1.arr[3]' }, value: { current: 4 } }
      ]);

      assert.deepEqual(message, {
        key: 'v1.arr[3]',
        index: 3,
        currentValue: 4,
        operation: 'push',
        changes: [{
          index: { current: 'v1.arr[3]' },
          value: { current: 4 }
        }]
      });
    },

    "notified in the collection level": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = { v1: { arr: [1, 2, 3] }};
      glue.resetListeners();

      glue.addListener('v1.arr', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[3]', 'push', original, current, [
        { index: { current: 'v1.arr[3]' }, value: { current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: [ 1, 2, 3 ],
        currentValue: [ 1, 2, 3, 4 ],
        operation: 'push',
        key: 'v1.arr[3]',
        changes: [ { index: { current: 'v1.arr[3]' }, value: { current: 4 } } ]
      });
    },

    "invocation cascades": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = { v1: { arr: [1, 2, 3] }};
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[3]', 'push', original, current, [
        { index: { current: 'v1.arr[3]' }, value: { current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ 1, 2, 3 ] },
        currentValue: { arr: [ 1, 2, 3, 4 ] },
        operation: 'push',
        key: 'v1.arr[3]',
        changes: [ { index: { current: 'v1.arr[3]' }, value: { current: 4 } } ]
      });
    },

    "invokes listeners assigned to any key (*)": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = { v1: { arr: [1, 2, 3] }};
      glue.resetListeners();

      glue.addListener('*', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[3]', 'push', original, current, [
        { index: { current: 'v1.arr[3]' }, value: { current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { v1: { arr: [ 1, 2, 3 ] } },
        currentValue: { v1: { arr: [ 1, 2, 3, 4 ] } },
        operation: 'push',
        key: 'v1.arr[3]',
        changes: [ { index: { current: 'v1.arr[3]' }, value: { current: 4 } } ]
      });
    },
  },

  "array and assigned combination (nested)": {
    topic: new Glue({ arr: [ {v1: ''} ]}),

    "notifies listener of that key": function(glue) {
      var message = {},
          original = { arr: [ { v1: '' } ] },
          current = { arr: [ { v1: 'a value' } ] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[0].v1', function(msg) {
        message = msg;
      });

      glue.notify('arr[0].v1', 'set', original, current, { 'arr[0].v1':
        { value: { old: '', current: 'a value' } }
      });

      assert.deepEqual(message, {
        oldValue: '',
        currentValue: 'a value',
        operation: 'set',
        key: 'arr[0].v1',
        changes: { 'arr[0].v1': { value: { current: 'a value', old: '' } } }
      });
    },

    "notifies listeners of the parent array at the specified index": function(glue) {
      var message = {},
          original = { arr: [ { v1: '' } ] },
          current = { arr: [ { v1: 'a value' } ] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[0]', function(msg) {
        message = msg;
      });

      glue.notify('arr[0].v1', 'set', original, current, { 'arr[0].v1':
        { value: { old: '', current: 'a value' } }
      });

      assert.deepEqual(message, {
        oldValue: { v1: '' },
        currentValue: { v1: 'a value' },
        operation: 'set',
        key: 'arr[0].v1',
        changes: { 'arr[0].v1': { value: { current: 'a value', old: '' } } }
      });
    },

    "notifies listeners parent array at the collection level": function(glue) {
      var message = {},
          original = { arr: [ { v1: '' } ] },
          current = { arr: [ { v1: 'a value' } ] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr', function(msg) {
        message = msg;
      });

      glue.notify('arr[0].v1', 'set', original, current, { 'arr[0].v1':
        { value: { old: '', current: 'a value' } }
      });

      assert.deepEqual(message, {
        oldValue: [{ v1: '' }],
        currentValue: [{ v1: 'a value' }],
        operation: 'set',
        key: 'arr[0].v1',
        changes: { 'arr[0].v1': { value: { current: 'a value', old: '' } } }
      });
    },

    "notifies listener of that key": function(glue) {
      var message = {},
          original = { arr: [ { v1: '' } ] },
          current = { arr: [ { v1: 'a value' } ] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('*', function(msg) {
        message = msg;
      });

      glue.notify('arr[0].v1', 'set', original, current, { 'arr[0].v1':
        { value: { old: '', current: 'a value' } }
      });

      assert.deepEqual(message, {
        oldValue: { arr: [ { v1: '' } ] },
        currentValue: { arr: [ { v1: 'a value' } ] },
        operation: 'set',
        key: 'arr[0].v1',
        changes: { 'arr[0].v1': { value: { current: 'a value', old: '' } } }
      });
    }
  },

  "a single operations that have multiple side effects": {
    topic: new Glue({ v1: { arr: [1, 2, 3, 4, 5] }}),

    "notifies listener on a specific index": function(glue) {
      var message = {};
          original = { v1: { arr: [1, 2, 3, 4, 5] }};
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[0]', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr', 'filter', original, current, [
        { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
        { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
        { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
      ]);

      assert.deepEqual(message, {
        oldValue: 1,
        currentValue: 2,
        index: 0,
        operation: 'filter',
        key: 'v1.arr',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });
    },

    "notifies listener on an element level": function(glue) {
      var messages = [];
          original = { v1: { arr: [1, 2, 3, 4, 5] }};
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[]', function(msg) {
        messages.push(msg);
      });

      glue.notify('v1.arr', 'filter', original, current, [
        { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
        { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
        { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
      ]);

      assert.deepEqual(messages[0], {
        oldValue: 5,
        index: 4,
        operation: 'filter',
        key: 'v1.arr',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });

      assert.deepEqual(messages[1], {
        oldValue: 3,
        index: 2,
        operation: 'filter',
        key: 'v1.arr',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });

      assert.deepEqual(messages[2], {
        oldValue: 1,
        currentValue: 2,
        index: 0,
        operation: 'filter',
        key: 'v1.arr',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });
    },

    "notifies listener on a collection level": function(glue) {
      var messages = [];
          original = { v1: { arr: [1, 2, 3, 4, 5] }};
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr', 'filter', original, current, [
        { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
        { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
        { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
      ]);

      assert.deepEqual(message, {
        oldValue: [ 1, 2, 3, 4, 5 ],
        currentValue: [ 2, 4 ],
        operation: 'filter',
        key: 'v1.arr',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });
    },

    "notifies listener on a collection level": function(glue) {
      var messages = [];
          original = { v1: { arr: [1, 2, 3, 4, 5] }};
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr', 'filter', original, current, [
        { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
        { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
        { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ 1, 2, 3, 4, 5 ] },
        currentValue: { arr: [ 2, 4 ] },
        key: 'v1.arr',
        operation: 'filter',
        changes: [
          { index: { old: 'v1.arr[4]' }, value: { old: 5 } },
          { index: { old: 'v1.arr[2]' }, value: { old: 3 } },
          { index: { old: 'v1.arr[0]' }, value: { old: 1 } }
        ]
      });
    }
  },

  "complex nesting (assigned, array, assigned)": {
    topic: new Glue({ v1: { arr: [ { v2: '' } ]}}),

    "notifies listener of the key specific key": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[0].v2', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: '',
        currentValue: 'a value',
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: {
            'v1.arr[0].v2': {
                value: { current: 'a value', old: '' }
            }
        }
      })
    },

    "notifies listener of the parent array at a specific index": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[0]', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: { v2: '' },
        currentValue:  { v2: 'a value' },
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: {
            'v1.arr[0].v2': {
                value: { current: 'a value', old: '' }
            }
        }
      })
    },

    "notifies listener of the parent array at an element level": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[]', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: { v2: '' },
        currentValue:  { v2: 'a value' },
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: {
            'v1.arr[0].v2': {
                value: { current: 'a value', old: '' }
            }
        }
      })
    },

    "notifies listener of the parent array at the collection level": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: [ { v2: '' } ],
        currentValue: [ { v2: 'a value' } ],
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: { 'v1.arr[0].v2': { value: { current: 'a value', old: '' } }
        }
      });
    },

    "cascades to root key": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: { arr: [ { v2: '' } ] },
        currentValue: { arr: [ { v2: 'a value' } ] },
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: { 'v1.arr[0].v2': { value: { current: 'a value', old: '' } }
        }
      });
    },

    "notifies liteners on any key (*)": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('*', function(msg) {
        message = msg;
      });

      glue.notify('v1.arr[0].v2', 'set', original, current, { 'v1.arr[0].v2':
        { value: { old: '', current: 'a value' }}
      });

      assert.deepEqual(message, {
        oldValue: { v1: { arr: [ { v2: '' } ] }},
        currentValue: { v1: { arr: [ { v2: 'a value' } ] }},
        operation: 'set',
        key: 'v1.arr[0].v2',
        changes: { 'v1.arr[0].v2': { value: { current: 'a value', old: '' } }
        }
      });
    }
  },

  "complex nesting (assigned, assigned, array)": {
    topic: new Glue({ v1: { v2: { arr: [1, 2, 3] }}}),

    "notifies listener on a specific index": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2.arr[3]', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        currentValue: 4,
        index: 3,
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
    },

    "notifies at an element level": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2.arr[]', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        currentValue: 4,
        index: 3,
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
    },

    "notifies at a collection level": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2.arr', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: [ 1, 2, 3 ],
        currentValue: [ 1, 2, 3, 4 ],
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
    },

    "notifies parent key": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ 1, 2, 3 ] },
        currentValue: { arr: [ 1, 2, 3, 4 ] },
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
  },

    "notifies all the way to the root key": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { v2: { arr: [ 1, 2, 3 ] } },
        currentValue: { v2: { arr: [ 1, 2, 3, 4 ] } },
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
    },

    "notifies keys on any key (*)": function(glue) {
      var message = {};
          original = { v1: { v2: { arr: [1, 2, 3] }}};
          current = { v1: { v2: { arr: [1, 2, 3, 4] }}};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('*', message, function(msg) {
        message = msg;
      });

      glue.notify('v1.v2.arr[3]', 'push', original, current, [
        { index: { current: 'v1.v2.arr[3]' }, value: {  current: 4 } }
      ]);

      assert.deepEqual(message, {
        oldValue: { v1: { v2: { arr: [ 1, 2, 3 ] } } },
        currentValue: { v1: { v2: { arr: [ 1, 2, 3, 4 ] } } },
        operation: 'push',
        key: 'v1.v2.arr[3]',
        changes: [
          { index: { current: 'v1.v2.arr[3]' }, value: { current: 4 } }
        ]
      });
    }
  }
});

suite.export(module);
