var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('filter operation');

suite.addBatch({
  "target obj": {
    "filter on array target obj": function() {
      var glue = new Glue([1,2,3,4,5]);

      glue.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(glue.target, [2,4]);
    },

    "filter on array nested inside obj": function() {
      var glue = new Glue({ arr: [1,2,3,4,5] });

      glue.filter('arr', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(glue.target, { arr: [2,4] });
    }
  },

  "notification" : {
    "notifies in decending order": function() {
      var messages = [],
          glue = new Glue({ arr: [1,2,3,4,5] });

      glue.addObserver('arr[]', function(msg) {
        messages.push(msg);
      });

      glue.filter('arr', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(messages, [
        { value: undefined, index: 4, operation: 'filter' },
        { value: undefined, index: 3, operation: 'filter' },
        { value: undefined, index: 2, operation: 'filter' },
        { value: 4, index: 1, operation: 'filter' },
        { value: 2, index: 0, operation: 'filter' }
      ]);
    }
  }
});

suite.export(module);


