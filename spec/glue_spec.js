var vows = require('vows')
,   util = require('util')
,   assert = require('assert')

,   suite = vows.describe('Glue private functions')
,   Glue = require("../lib/glue");

suite.addBatch({
  "setPropertyOnBoundObject": {
    "simple assignment": function() {
      var topic = new Glue({level1: ''});

      topic.setPropertyOnBoundObject('level1', 'top level');
      assert.equal(topic.boundObject.level1, "top level");
    },

    "singly nested assignment": function() {
      var topic = new Glue({level1: {level2: ''}});

      topic.setPropertyOnBoundObject('level1.level2', 'two levels');
      assert.equal(topic.boundObject.level1.level2, "two levels");
    },

    "doubly nested assignment": function() {
      var topic = new Glue({level1: {level2: {level3: ''}}});

      topic.setPropertyOnBoundObject('level1.level2.level3', 'three levels');
      assert.equal(topic.boundObject.level1.level2.level3, "three levels");
    }
  },
}).export(module);

