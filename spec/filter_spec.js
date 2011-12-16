var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('filter');

suite.addBatch({
  "target is collection": {
    topic: new Glue([]),

    "filters according to handler": function(topic) {
      topic.target = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      topic.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(topic.target, [2, 4, 6, 8, 10]);
    },

    "notifies listeners that particular index has been removed": function(topic) {
      var invoked1 = []
        , invoked2 = [];

      topic.target = [1, 2, 3, 4];

      topic.addListener('[0], [2]', function() {
        invoked1.push(1);
      });

      topic.addListener('[1], [3]', function() {
        invoked2.push(1);
      });

      topic.filter(function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(invoked1, [1,1]);
      assert.deepEqual(invoked2, []);
    }
  },

  "target is a collection within an object": {
    topic: new Glue({}),

    "can filter on array within an object": function(topic) {
      topic.target = { arr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] };
      topic.filter('arr', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(topic.target.arr, [2, 4, 6, 8, 10]);
    },

    "can filter from multidimentional arrays": function(topic) {
      topic.target = { arr: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]] };
      topic.filter('arr[0]', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(topic.target.arr[0], [2, 4, 6, 8, 10]);
    },

    "can filter from arrays nested within an object and an array": function(topic) {
      topic.target = { arr1: [{ arr2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}] };
      topic.filter('arr1[0].arr2', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(topic.target.arr1[0].arr2, [2, 4, 6, 8, 10]);
    },

    "notifies listeners that particular index has been removed (simple)": function(topic) {
      var invoked1 = []
        , invoked2 = [];

      topic.target = { arr: [1, 2, 3, 4] };

      topic.addListener('arr[0], arr[2]', function() {
        invoked1.push(1);
      });

      topic.addListener('arr[1], arr[3]', function() {
        invoked2.push(1);
      });

      topic.filter('arr', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(invoked1, [1,1]);
      assert.deepEqual(invoked2, []);
    },

    "notifies listeners that particular index has been removed (complex)": function(topic) {
      var invoked = [];

      topic.target = { arr1: [{ arr2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}] };

      topic.addListener('arr1[0].arr2', function() {
        invoked.push(1);
      });

      topic.filter('arr1[0].arr2', function(num) {
        return num % 2 === 0;
      });

      assert.deepEqual(invoked, [1]);
    }
  }
});

suite.export(module);
