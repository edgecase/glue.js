var vows = require('vows')
,   _ = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('current spec');

suite.addBatch({
  "current test": {
    topic: new Glue ({ v1: { arr: [ { v2: '' } ]}}),

    "notifies listener of that key": function(glue) {
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
    }
  }
});

suite.export(module)
