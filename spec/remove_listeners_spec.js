var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('removeListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "all key": {
    topic: new Glue({v1: '', v2: ''}),

    "removes all listeners if no key is passed": function(topic) {
      var invoked = false;

      topic.addListener(function() {
        invoked = true;
      });

      topic.addListener('v1', function() {
        invoked = true;
      });

      topic.addListener('v2', function() {
        invoked = true;
      });

      topic.addListener('v2#length', function() {
        invoked = true;
      });

      topic.removeListener();
      topic.set('v1,v2', 'set');

      assert.equal(invoked, false);
    }
  },

  "any key": {
    topic: new Glue({v1: ''}),

    "removes all listeners assigned to any key": function(topic) {
      var invoked = [];

      topic.addListener(function() {
        invoked.push(1);
      });

      topic.addListener('v1', function() {
        invoked.push(2);
      });

      topic.removeListener('*');
      topic.set('v1', 'set');

      assert.deepEqual(invoked, [2]);
    }
  },

  "assigned key": {
    topic: new Glue({}),

    "": function(topic) {
    }
  },

  "computed key": {
  },

  "function key": {
  },

  "multiple": {
  },

  "notification": {
  },

  "chainability": {
    topic: new Glue({v1: ''}),

    "invoking set returns itself for chainability": function(topic) {
      var returnedValue = topic.removeListener('v1')
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
