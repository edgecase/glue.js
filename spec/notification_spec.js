var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('notification system');

suite.addBatch({
  "notifies only when a value is modified": {
    topic: new Glue({}),

    "for any key": function(topic) {
      var invoked = false;

      topic.target = { v1: 'original' };

      topic.addListener(function() {
        invoked = true;
      });

      topic.set('v1', 'original');
      assert.equal(invoked, false);

      topic.set('v1', 'different');
      assert.equal(invoked, true);
    },

    "for assigned": function(topic) {
      var invoked = false;

      topic.target = { v1: 'original' };

      topic.addListener('v1', function() {
        invoked = true;
      });

      topic.set('v1', 'original');
      assert.equal(invoked, false);

      topic.set('v1', 'different');
      assert.equal(invoked, true);
    },

    "for computed": function(topic) {
      var invoked = false;

      topic.target = { v1: 'original' };

      topic.addListener('v1#length', function() {
        invoked = true;
      });

      topic.set('v1', 'original');
      assert.equal(invoked, false);

      topic.set('v1', 'different');
      assert.equal(invoked, true);
    }
  },

  "decending": {
    topic: new Glue({}),

    "notifies parent nodes": function (topic) {
      var invoked = [];

      topic.target = { v1: { v2: { v3: '' }}};

      topic.addListener("v1.v2.v3", function() {
        invoked.push(1);
      });

      topic.addListener("v1.v2", function() {
        invoked.push(1);
      });

      topic.addListener("v1", function() {
        invoked.push(1);
      });

      topic.set('v1.v2.v3', 'set');
      assert.deepEqual(invoked, [1,1,1]);
    }
  },

  "chainability": {
    topic: new Glue({v1: ''}),

    "invoking set returns itself for chainability": function(topic) {
      var returnedValue = topic.notify('v1', {
          oldValue: 0
        , newValue: 1
      })

      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
