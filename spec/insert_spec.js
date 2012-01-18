var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('insert operation');

suite.addBatch({
  "target obj": {
    topic: new Glue([]),

    "inserts at a particular index": function(glue) {
      glue.target = [1,2,3,4];

      glue.insert(1, 9);
      assert.deepEqual(glue.target, [1, 9, 2, 3, 4]);
    },

    "inserts at a particular index within an a obj": function(glue) {
      glue.target = { arr: [1,2,3,4] };

      glue.insert('arr', 1, 9);
      assert.deepEqual(glue.target, { arr: [1, 9, 2, 3, 4] });
    }
  },

  "notification": {
    topic: new Glue([]),

    "notifies from the point of insert": function(glue) {
      var original = [],
          current = [];

      glue.target = [1, 2, 3, 4];

      glue.addListener('[]', function(msg) {
        original.push([msg.oldIndex, msg.oldValue]);
        current.push([msg.currentIndex, msg.currentValue]);
      });

      glue.insert(1, 9);

      assert.deepEqual(original, [
        [ undefined, undefined ],
        [ 1, 2 ],
        [ 2, 3 ],
        [ 3, 4 ]
      ]);

      assert.deepEqual(current, [
        [ 1, 9 ],
        [ 2, 2 ],
        [ 3, 3 ],
        [ 4, 4 ]
      ]);
    },

    "top edgecase test": function(glue) {
      var original = [],
          current = [];

      glue.target = [1, 2, 3, 4];

      glue.addListener('[]', function(msg) {
        original.push([msg.oldIndex, msg.oldValue]);
        current.push([msg.currentIndex, msg.currentValue]);
      });

      glue.insert(0, 9);

      assert.deepEqual(original, [
        [ undefined, undefined ],
        [ 0, 1 ],
        [ 1, 2 ],
        [ 2, 3 ],
        [ 3, 4 ]
      ]);

      assert.deepEqual(current, [
        [ 0, 9 ],
        [ 1, 1 ],
        [ 2, 2 ],
        [ 3, 3 ],
        [ 4, 4 ]
      ]);
    },

    "end edgecase test": function(glue) {
      var original = [],
      current = [];

      glue.target = [1, 2, 3, 4];

      glue.addListener('[]', function(msg) {
        original.push([msg.oldIndex, msg.oldValue]);
        current.push([msg.currentIndex, msg.currentValue]);
      });

      glue.insert(4, 9);

      assert.deepEqual(original, [
        [ undefined, undefined ]
      ]);

      assert.deepEqual(current, [
        [ 4, 9 ]
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

