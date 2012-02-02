var vows = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('deep clone');

suite.addBatch({
  "cloning": {
    "[]": function() {
      var a = [],
          b = Glue.deepClone(a);

      b.push(1);
      assert.deepEqual(a, []);
      assert.deepEqual(b, [1]);
    },

    "[1, 2, 3]": function() {
      var a = [1, 2, 3],
          b = Glue.deepClone(a);

      b.push(4);
      assert.deepEqual(a, [1, 2, 3]);
      assert.deepEqual(b, [1, 2, 3, 4]);
    },

    "{}": function() {
      var a = {},
          b = Glue.deepClone(a);

      b.v1 = 'something';
      assert.deepEqual(a, {});
      assert.deepEqual(b, { v1: 'something' });
    },

    "{v1: 'something'}": function() {
      var a = {v1: 'something'},
          b = Glue.deepClone(a);

      b.v2 = 'something else';
      assert.deepEqual(a, { v1: 'something'});
      assert.deepEqual(b, { v1: 'something', v2: 'something else' });
    },

    "[1, 2, 3]": function() {
      var a = [ {v1: ''}, {v1: ''}],
          b = Glue.deepClone(a);

      b[0].v1 = 'something';
      assert.deepEqual(a, [ {v1: ''}, {v1: ''}]);
      assert.deepEqual(b, [ {v1: 'something'}, {v1: ''}]);
    },

    "[[function, {v1: { v2: function }}], {v1: [1, 2, 3]}, function]": function() {
      var aFunction = function() {};
          a = [[aFunction, {v1: { v2: aFunction }}], {v1: [1, 2, 3]}, aFunction],
          b = Glue.deepClone(a);

      b[0][1].v1 = 'something';
      assert.deepEqual(a, [[aFunction, {v1: { v2: aFunction }}], {v1: [1, 2, 3]}, aFunction]);
      assert.deepEqual(b, [[null, {v1: "something" }], {v1: [1, 2, 3]}, null]);
    }
  },
});

suite.export(module)

