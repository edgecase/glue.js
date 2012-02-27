var vows   = require('vows')
,   _      = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('swap operation');

suite.addBatch({
  "swap": {
    "on keys": function() {
      var glue = new Glue({ v1: 'hello', v2: 'world' });

      glue.swap('v1', 'v2');
      assert.deepEqual(glue.target, { v1: 'world', v2: 'hello' });
    },

    "on indices": function() {
      var glue = new Glue([1, 2, 3]);

      glue.swap('[0]', '[2]');
      assert.deepEqual(glue.target, [3, 2, 1]);
    },

    "swap to another obj": function() {
      var glue = new Glue({ v1: '', v2: { v3: 'hello' }});

      glue.swap('v1', 'v2.v3');
      assert.deepEqual(glue.target, { v1: 'hello', v2: { v3: '' }});
    },

    "swap to another obj": function() {
      var glue = new Glue({ arr1: [], v1: { arr2: [1, 2, 3] }});

      glue.swap('arr1', 'v1.arr2');
      assert.deepEqual(glue.target, { arr1: [1, 2, 3], v1: { arr2: [] }});
    },

    "notifies": function() {
      var messages = [];
          glue = new Glue([1, 2, 3]);

      glue.addObserver(function(msg) {
        messages.push(msg);
      });

      glue.swap('[0]', '[2]');
      assert.deepEqual(messages, [
        { value: [ 3, 2, 1 ], operation: 'swap' }
      ]);
    }
  },
});

suite.export(module);
