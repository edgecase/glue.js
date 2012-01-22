var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('get operation');

suite.addBatch({
  "target obj": {
    topic: new Glue([]),

    "get with empty key returns the target array": function(glue) {
      var target = [1,2,3,4];
      glue.target = target;

      var obj = glue.get('');
      assert.equal(obj, glue.target);
    },

    "get with empty key returns the target obj": function(glue) {
      var target = {v1: 'obj'};
      glue.target = target;

      var obj = glue.get('');

      assert.equal(obj, glue.target);
    },

    "any key": function(glue) {
      var target = {v1: 'obj'};
      glue.target = target;

      var obj = glue.get('*');

      assert.equal(obj, glue.target);
    }
  },

  "for keys": {
    topic: new Glue({}),

    "can be retrieved": function(glue) {
      glue.target = { v1: 'get this' };
      assert.equal(glue.get('v1'), 'get this');
    },

    "can be nested": function(glue) {
      glue.target = { v1: { v2: 'get this' }};
      assert.equal(glue.get('v1.v2'), 'get this');
    },

    "undefined keys": function(glue) {
      glue.target = { v1: { v2: 'get this' }};
      assert.equal(glue.get('v3'), undefined);
    }
  }
});

suite.export(module);
