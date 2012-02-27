var vows   = require('vows')
,   _      = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('sort operation');

suite.addBatch({
  "target obj": {
    "filter on array target obj": function() {
      var glue = new Glue(_.shuffle(['1elem', '2elem', '3elem', '4elem' ,'5elem']));

      glue.sortBy(function(elem) { return parseInt(elem) });
      assert.deepEqual(glue.target, ['1elem', '2elem', '3elem', '4elem' ,'5elem']);
    },

    "filter on array a key": function() {
      var glue = new Glue( { arr: _.shuffle(['1elem', '2elem', '3elem', '4elem' ,'5elem'])});

      glue.sortBy('arr', function(elem) { return parseInt(elem) });
      assert.deepEqual(glue.target.arr, ['1elem', '2elem', '3elem', '4elem' ,'5elem']);
    },

    "notifies changed index": function() {
      var messages = [],
          glue = new Glue(['4elem', '5elem' , '3elem', '1elem' ,'2elem']);

      glue.addObserver('[]', function(msg) {
        messages.push(msg);
      });

      glue.sortBy(function(elem) { return parseInt(elem) });
      assert.deepEqual(messages, [
        { value: '5elem', index: 4, operation: 'filter' },
        { value: '4elem', index: 3, operation: 'filter' },
        { value: '2elem', index: 1, operation: 'filter' },
        { value: '1elem', index: 0, operation: 'filter' }
      ]);
    }
  }
});

suite.export(module);


