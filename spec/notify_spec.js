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
          message2 = {},
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

      glue.notify('set', original, current, [{ old: 'v1', current: 'v1' }]);

      assert.deepEqual(message1, {
        operation: 'set',
        oldValue: original,
        currentValue: current
      });

      assert.deepEqual(message2, {
        operation: 'set',
        oldValue: original,
        currentValue: current
      });
    },

    "notifies listeners assigned to the key": function(glue) {
      var message  = {},
          original = { v1: 1 },
          current  = { v1: 2 };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [{ old: 'v1', current: 'v1' }]);

      assert.deepEqual(message, {
        operation: 'set',
        oldValue: 1,
        currentValue: 2
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

      glue.notify('set', original, current, [{ old: 'v1', current: 'v1' }]);

      assert.deepEqual(message1, {
        operation: 'set',
        oldValue: 1,
        currentValue: 2
      });

      assert.deepEqual(message2, {});
    }
  },

  "array (non-nested)" : {
    topic: new Glue({}),

    "notify at an element level": function(glue) {
      var message  = {},
          original = [1, 2, 3],
          current  = [1, 2, 3, 1];

      glue.target = current;
      glue.resetListeners();

      glue.addListener('[]', function(msg) {
        message = msg;
      });

      glue.notify('push', original, current, [
        { current: '[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        currentIndex: 3,
        currentValue: 1
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

      glue.notify('push', original, current, [
        { current: '[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        currentIndex: 3,
        currentValue: 1
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

      glue.notify('push', original, current, [
        { current: '[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        oldValue: original,
        currentValue: current
      });
    },

    "notifies calculated value if changed": function(glue) {
      var message = {},
          original = [1, 2, 3],
          current  = [1, 2, 3, 1];

      glue.target = current;
      glue.resetListeners();

      glue.addListener('#length', function(msg) {
        message = msg;
      });

      glue.notify('push', original, current, [
        { current: '[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        oldValue: 3,
        currentValue: 4
      });
    },
  },

  "array (nested)": {
    topic: new Glue({}),

    "notifies on an element level": function(glue) {
      var message  = {},
          original = { arr: [1, 2, 3] },
          current  = { arr: [1, 2, 3, 1] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[]', function(msg) {
        message = msg;
      });

      glue.notify('push', original, current, [
        { current: 'arr[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        currentIndex: 3,
        currentValue: 1
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

      glue.notify('push', original, current, [
        { current: 'arr[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        currentIndex: 3,
        currentValue: 1
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

      glue.notify('push', original, current, [
        { current: 'arr[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        oldValue: [1, 2, 3],
        currentValue: [1, 2, 3, 1]
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

      glue.notify('push', original, current, [
        { current: 'arr[3]' }
      ]);

      assert.deepEqual(message, {
        operation: 'push',
        oldValue: { arr: [1, 2, 3] },
        currentValue: { arr: [1, 2, 3, 1] }
      });
    }
  },

  "assigned (nested)": {
    topic: new Glue({}),

    "invokes listeners of that key": function(glue) {
      var message  = {},
          original = { v1: { v2: '' }},
          current  = { v1: { v2: 'a value' }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.v2', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [{ old: 'v1.v2', current: 'v1.v2' }]);

      assert.deepEqual(message, {
        operation: 'set',
        oldValue: '',
        currentValue: 'a value'
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

      glue.notify('set', original, current, [{ old: 'v1.v2', current: 'v1.v2' }]);

      assert.deepEqual(message, {
        operation: 'set',
        oldValue: { v1: { v2: '' }},
        currentValue: {v1: { v2: 'a value' }}
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

      glue.notify('set', original, current, [{ old: 'v1.v2', current: 'v1.v2' }]);

      assert.deepEqual(invocations, [1]);
    },
  },

  "assigned and array combination (nested)": {
    topic: new Glue({}),

    "notified in an element level": function(glue) {
      var message  = {},
          original = { v1: { arr: [1, 2, 3] }},
          current  = { v1: { arr: [1, 2, 3, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[]', function(msg) {
        message = msg;
      });

      glue.notify('push', original, current, [
        { current: 'v1.arr[3]' }
      ]);

      assert.deepEqual(message, {
        currentIndex: 3,
        currentValue: 4,
        operation: 'push'
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

      glue.notify('push', original, current, [
        { current: 'v1.arr[3]' }
      ]);

      assert.deepEqual(message, {
        currentIndex: 3,
        currentValue: 4,
        operation: 'push'
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

      glue.notify('push', original, current, [
        { current: 'v1.arr[3]' }
      ]);

      assert.deepEqual(message, {
        oldValue: [ 1, 2, 3 ],
        currentValue: [ 1, 2, 3, 4 ],
        operation: 'push'
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

      glue.notify('push', original, current, [
        { current: 'v1.arr[3]' }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ 1, 2, 3 ] },
        currentValue: { arr: [ 1, 2, 3, 4 ] },
        operation: 'push'
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

      glue.notify('push', original, current, [
        { current: 'v1.arr[3]' }
      ]);

      assert.deepEqual(message, {
        oldValue: { v1: { arr: [ 1, 2, 3 ] } },
        currentValue: { v1: { arr: [ 1, 2, 3, 4 ] } },
        operation: 'push'
      });
    },
  },

  "array and assigned combination (nested)": {
    topic: new Glue({}),

    "notifies listener of that key": function(glue) {
      var message = {},
          original = { arr: [ { v1: '' } ] },
          current = { arr: [ { v1: 'a value' } ] };

      glue.target = current;
      glue.resetListeners();

      glue.addListener('arr[0].v1', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [{
        old: 'arr[0].v1', current: 'arr[0].v1'
      }]);

      assert.deepEqual(message, {
        oldValue: '',
        currentValue: 'a value',
        operation: 'set'
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

      glue.notify('set', original, current, [{
        old: 'arr[0].v1', current: 'arr[0].v1'
      }]);

      assert.deepEqual(message, {
        oldValue: { v1: '' },
        currentValue: { v1: 'a value' },
        oldIndex: 0,
        currentIndex: 0,
        operation: 'set'
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

      glue.notify('set', original, current, [{
        old: 'arr[0].v1', current: 'arr[0].v1'
      }]);

      assert.deepEqual(message, {
        oldValue: [ { v1: '' } ],
        currentValue: [ { v1: 'a value' } ],
        operation: 'set'
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

      glue.notify('set', original, current, [{
        old: 'arr[0].v1', current: 'arr[0].v1'
      }]);

      assert.deepEqual(message, {
        oldValue: { arr: [ { v1: '' } ] },
        currentValue: { arr: [ { v1: 'a value' } ] },
        operation: 'set'
      });
    }
  },

  "a single operations that have multiple side effects": {
    topic: new Glue({}),

    "notifies listener on a specific index": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3, 4, 5] }},
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[0]', function(msg) {
        message = msg;
      });

      glue.notify('filter', original, current, [
        { old: 'v1.arr[4]' }, { old: 'v1.arr[2]' }, { old: 'v1.arr[0]' }
      ]);

      assert.deepEqual(message, {
        oldValue: 1,
        oldIndex: 0,
        operation: 'filter'
      });
    },

    "notifies listener on an element level": function(glue) {
      var messages = [],
          original = { v1: { arr: [1, 2, 3, 4, 5] }},
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr[]', function(msg) {
        messages.push(msg);
      });

      glue.notify('filter', original, current, [
        { old: 'v1.arr[4]' }, { old: 'v1.arr[2]' }, { old: 'v1.arr[0]' }
      ]);

      assert.deepEqual(messages[0], {
        oldValue: 5,
        oldIndex: 4,
        operation: 'filter'
      });

      assert.deepEqual(messages[1], {
        oldValue: 3,
        oldIndex: 2,
        operation: 'filter'
      });

      assert.deepEqual(messages[2], {
        oldValue: 1,
        oldIndex: 0,
        operation: 'filter'
      });
    },

    "notifies listener on a collection level": function(glue) {
      var messages = [],
          original = { v1: { arr: [1, 2, 3, 4, 5] }},
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1.arr', function(msg) {
        message = msg;
      });

      glue.notify('filter', original, current, [
        { old: 'v1.arr[4]' }, { old: 'v1.arr[2]' }, { old: 'v1.arr[0]' }
      ]);

      assert.deepEqual(message, {
        oldValue: [ 1, 2, 3, 4, 5 ],
        currentValue: [ 2, 4 ],
        operation: 'filter'
      });
    },

    "notifies listener on a collection level": function(glue) {
      var message = {},
          original = { v1: { arr: [1, 2, 3, 4, 5] }},
          current = { v1: { arr: [2, 4] }};

      glue.target = current;
      glue.resetListeners();

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('filter', original, current, [
        { old: 'v1.arr[4]' }, { old: 'v1.arr[2]' }, { old: 'v1.arr[0]' }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ 1, 2, 3, 4, 5 ] },
        currentValue: { arr: [ 2, 4 ] },
        operation: 'filter'
      });
    }
  },

  "complex nesting (assigned, array, assigned)": {
    topic: new Glue({}),

    "notifies listener of the key specific key": function(glue) {
      var message = {},
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[0].v2', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: '',
        currentValue: 'a value',
        operation: 'set'
      })
    },

    "notifies listener of the parent array at a specific index": function(glue) {
      var message = {},
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[0]', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: { v2: '' },
        currentValue: { v2: 'a value' },
        oldIndex: 0,
        currentIndex: 0,
        operation: 'set'
      })
    },

    "notifies listener of the parent array at an element level": function(glue) {
      var message = {},
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr[]', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: { v2: '' },
        currentValue: { v2: 'a value' },
        oldIndex: 0,
        operation: 'set',
        currentIndex: 0
      })
    },

    "notifies listener of the parent array at the collection level": function(glue) {
      var message = {},
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1.arr', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: [ { v2: '' } ],
        currentValue: [ { v2: 'a value' } ],
        operation: 'set'
      });
    },

    "cascades to root key": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('v1', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: { arr: [ { v2: '' } ] },
        currentValue: { arr: [ { v2: 'a value' } ] },
        operation: 'set'
      });
    },

    "notifies liteners on any key (*)": function(glue) {
      var message = {};
          original = { v1: { arr: [ { v2: '' } ]}},
          current = { v1: { arr: [ { v2: 'a value' } ]}};

      glue.addListener('*', function(msg) {
        message = msg;
      });

      glue.notify('set', original, current, [
        { old: 'v1.arr[0].v2', current: 'v1.arr[0].v2' }
      ]);

      assert.deepEqual(message, {
        oldValue: { v1: { arr: [ { v2: '' } ] } },
        currentValue: { v1: { arr: [ { v2: 'a value' } ] } },
        operation: 'set'
      });
    }
  }
});

suite.export(module);
