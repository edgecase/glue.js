var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('notification system');

suite.addBatch({
  "any key": {
    topic: new Glue({}),

    "notifies all any key listeners when values change": function(topic) {
      var invoked = false;

      topic.addListener(function() {
        invoked = true;
      });

      topic.notify('*', { oldValue: '', newValue: '' });
      assert.equal(invoked, false);

      topic.notify('*', { oldValue: '', newValue: 'something' });
      assert.equal(invoked, true);
    }
  },

  "assigned key": {
    topic: new Glue({}),

    "for non-nested key": function(topic) {
      var invoked = false;

      topic.addListener('v1', function() {
        invoked = true;
      });

      topic.notify('v1', { oldValue: '', newValue: '' });
      assert.equal(invoked, false);

      topic.notify('v1', { oldValue: '', newValue: 'something' });
      assert.equal(invoked, true);
    },

    "non-nested key notifies listeners assigned to any key": function(topic) {
      var invoked = false;

      topic.addListener(function() {
        invoked = true;
      });

      topic.notify('v1', { oldValue: '', newValue: '' });
      assert.equal(invoked, false);

      topic.notify('v1', { oldValue: '', newValue: 'something' });
      assert.equal(invoked, true);
    },

    "that are nested notifies the top and all decendent keys": function(topic) {
      var invoked1 = false
        , invoked2 = false
        , invoked3 = false
        , invoked4 = false;

      topic.target = { v1: { v2: { v3: '' } } };

      topic.addListener(function() {
        invoked1 = true;
      });

      topic.addListener('v1', function() {
        invoked2 = true;
      });

      topic.addListener('v1.v2', function() {
        invoked3 = true;
      });

      topic.addListener('v1.v2.v3', function() {
        invoked4 = true;
      });

      topic.notify('v1.v2.v3', { oldValue: '', newValue: 'something' });

      assert.equal(invoked1, true);
      assert.equal(invoked2, true);
      assert.equal(invoked3, true);
      assert.equal(invoked4, true);
    },

    "multiple": function(topic) {
      var invoked1 = false
        , invoked2 = false
        , invoked3 = false;

      topic.target = {v1: '', v2: {v3: ''}};

      topic.addListener('v1', function() {
        invoked1 = true;
      });

      topic.addListener('v2', function() {
        invoked2 = true;
      });

      topic.addListener('v2.v3', function() {
        invoked3 = true;
      });

      topic.notify('v1, v2.v3', { oldValue: '', newValue: 'something' });

      assert.equal(invoked1, true);
      assert.equal(invoked2, true);
      assert.equal(invoked3, true);
    }
  },

  "computed key": {
    topic: new Glue({}),

    "non-nested keys": function(topic) {
      var value = {};

      topic.target = { v1: 'original' };

      topic.addListener('v1#length', function(msg) {
        value.newValue = msg.newValue;
      });

      topic.set('v1', 'original');
      assert.equal(value.newValue, undefined);

      topic.set('v1', 'different');
      assert.equal(value.newValue, 9);
    },
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
