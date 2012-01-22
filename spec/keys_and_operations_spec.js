var vows = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('keys and operations');

suite.addBatch({
  "permutation of keys": {
    topic: [],

    "none": function() {
      assert.deepEqual(Glue.keysAndOperations(), [
       [], []
      ]);
    },

    "": function() {
      assert.deepEqual(Glue.keysAndOperations(''), [
       [''], []
      ]);
    },

    "key": function() {
      assert.deepEqual(Glue.keysAndOperations('key'), [
       ['key'], []
      ]);
    },

    ":operation": function() {
      assert.deepEqual(Glue.keysAndOperations(':operation'), [
        [''], ['operation']
      ]);
    },

    "key:operation": function() {
      assert.deepEqual(Glue.keysAndOperations('key:operation'), [
        ['key'], ['operation']
      ]);
    },

    "key1, key2:operation": function() {
      assert.deepEqual(Glue.keysAndOperations('key1, key2:operation'), [
        ['key1', 'key2'], ['operation']
      ]);
    },

    "key:operation1, operation2": function() {
      assert.deepEqual(Glue.keysAndOperations('key:operation1, operation2'), [
        ['key'], ['operation1', 'operation2']
      ]);
    },

    "key1, key2:operation1, operation2": function() {
      assert.deepEqual(Glue.keysAndOperations('key1, key2:operation1, operation2'), [
        ['key1', 'key2'], ['operation1', 'operation2']
      ]);
    }
  }
});

suite.export(module)

