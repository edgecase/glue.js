var vows = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('permutate key');

suite.addBatch({
  "permutation of keys": {
    topic: 'v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[2]',

    "only permutates on generic keys": function(key) {
      assert.deepEqual(Glue.permutateKey(key), [
        ['v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[2]', 'v1.v2.arr[0].v3.arr[1].arr[3].v4.arr[]', 2],
        ['v1.v2.arr[0].v3.arr[1].arr[3]', 'v1.v2.arr[0].v3.arr[1].arr[]', 3],
        ['v1.v2.arr[0].v3.arr[1]', 'v1.v2.arr[0].v3.arr[]', 1],
        ['v1.v2.arr[0]', 'v1.v2.arr[]', 0]
      ]);

    }
  }
});

suite.export(module)


