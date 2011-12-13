var vows   = require('vows')
  , assert = require('assert')
  , Glue   = require(__dirname + "/../lib/glue")

var suite  = vows.describe('normalizing keys');

suite.addBatch({
  "normalizing key": {
    "removes spaces": function() {
      assert.deepEqual(Glue.normalizeKey("fi.fi.   fum"), "fi.fi.fum");
    },

    "converts '#' to '.' ": function() {
      assert.deepEqual(Glue.normalizeKey("fi#fi"), "fi.fi");
    },

    "removes stray brackets": function() {
      assert.deepEqual(Glue.normalizeKey("0]"), "0");
    }
  }
});

suite.export(module);

