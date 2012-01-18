var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('filter operation');

suite.addBatch({
  "target obj": {
    topic: new Glue([]),

    "filter on array target obj": function(glue) {
      glue.target = [1,2,3,4,5];

      glue.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(glue.target, [2,4]);
    },

    "filter on array nested inside obj": function(glue) {
      glue.target = { arr: [1,2,3,4,5] };

      glue.filter('arr', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(glue.target, { arr: [2,4] });
    }
  },

  "notification" : {
    topic: new Glue({}),

    "notifies in decending order": function(glue) {
      var original = [],
          current = [];

      glue.target = [1,2,3,4,5];

      glue.addListener('[]', function(msg) {
        original.push([msg.oldIndex, msg.oldValue]);
        current.push([msg.currentIndex, msg.currentValue]);
      });

      glue.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(original, [
        [ 4, 5 ],
        [ 2, 3 ],
        [ 0, 1 ]
      ]);

      assert.deepEqual(current, [
        [ undefined, undefined ],
        [ undefined, undefined ],
        [ undefined, undefined ]
      ]);
    }
  }
});

suite.export(module);

