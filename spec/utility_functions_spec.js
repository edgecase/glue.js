var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('utility functions')
,   Glue = require("../lib/glue");

suite.addBatch({
  "": {
    topic: new Glue(),

    "keyPathIsFunctional": function(topic) {
      assert.equal(topic.keyPathIsFunctional('foo()'), true);
    },

    "keyPathIsFunctionalOrCalculated for functions": function(topic) {
      assert.equal(topic.keyPathIsFunctionalOrCalculated('foo()'), true);
    },

    "keyPathIsFunctionalOrCalculated for calculated": function(topic) {
      assert.equal(topic.keyPathIsFunctionalOrCalculated('(foo)'), true);
    }
  }
});

suite.export(module);

