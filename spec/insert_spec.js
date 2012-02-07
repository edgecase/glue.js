var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('insert operation');

suite.addBatch({
  "target obj": {
    "inserts at a particular index": function() {
      var glue =  new Glue([1,2,3,4]);

      glue.insert(1, 9);
      assert.deepEqual(glue.target, [1, 9, 2, 3, 4]);
    },

    "inserts at a particular index within an a obj": function() {
      var glue =  new Glue({ arr: [1,2,3,4] });

      glue.insert('arr', 1, 9);
      assert.deepEqual(glue.target, { arr: [1, 9, 2, 3, 4] });
    }
  },

  "notification": {
    "notifies from the point of insert": function() {
      var messages = [],
          glue = new Glue([1, 2, 3, 4]);

      glue.addListener('[]', function(msg) {
        messages.push(msg);
      });

      glue.insert(1, 9);

      assert.deepEqual(messages, [
        { value: 9, index: 1, operation: 'insert' },
        { value: 2, index: 2, operation: 'insert' },
        { value: 3, index: 3, operation: 'insert' },
        { value: 4, index: 4, operation: 'insert' }
      ]);
    },

    "top edgecase test": function() {
      var messages = [],
          glue = new Glue([1, 2, 3, 4]);

      glue.addListener('[]', function(msg) {
        messages.push(msg);
      });

      glue.insert(0, 9);

      assert.deepEqual(messages, [
        { value: 9, index: 0, operation: 'insert' },
        { value: 1, index: 1, operation: 'insert' },
        { value: 2, index: 2, operation: 'insert' },
        { value: 3, index: 3, operation: 'insert' },
        { value: 4, index: 4, operation: 'insert'
    }
      ]);
    },

    "end edgecase test": function() {
      var messages = [],
          glue = new Glue([1, 2, 3, 4]);

      glue.addListener('[]', function(msg) {
        messages.push(msg);
      });

      glue.insert(4, 9);

      assert.deepEqual(messages, [
        { value: 9, index: 4, operation: 'insert' }
      ]);
    }
  },

  chainability: {
    topic: new Glue([]),

    "returns itself for chainalibility": function(glue) {
      var returnedValue = glue.insert(0, 1);
      assert.deepEqual(glue, returnedValue)
    }
  }
});

suite.export(module);

