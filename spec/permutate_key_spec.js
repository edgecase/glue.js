var vows = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('permutate key');

suite.addBatch({
  "permutation of keys": {
    topic: 'v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[2]',

    "only permutates on generic keys": function(key) {
      assert.deepEqual(Glue.permutateKey(key), [
        {
          specific: 'v1.v2.arr[0]',
          generic:  'v1.v2.arr[]',
          index:    0
        },

        {
          specific: 'v1.v2.arr[0].v3.arr[1]',
          generic:  'v1.v2.arr[0].v3.arr[]',
          index:    1
        },

        {
          specific: 'v1.v2.arr[0].v3.arr[1].arr[3]',
          generic:  'v1.v2.arr[0].v3.arr[1].arr[]',
          index:    3
        },

        {
          specific: 'v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[2]',
          generic:  'v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[]',
          index:    2
        }
      ]);
    }
  },

  "empty string": {
    topic: "",

    "only permutates on generic keys": function(key) {
      assert.deepEqual(Glue.permutateKey(key), []);
    }
  }
});

suite.export(module)


