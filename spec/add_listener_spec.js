var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('addListener');

suite.addBatch({
  "any key": {
    topic: new Glue({}),

    "can be an anonymous function": function(topic) {
      topic.target = {v1: 0, v2: 0};
      var invoked = 0;

      topic.addListener(function() {
        invoked++;
      });

      topic.set('v1', 1);
      assert.equal(invoked, 1);

      topic.set('v2', 1);
      assert.equal(invoked, 2);
    },

    "can be explicitly specified": function(topic) {
      topic.target = {v1: 0, v2: 0};

      var invoked = 0;

      topic.addListener("*", function() {
        invoked++;
      });

      topic.set('v1', 1);
      assert.equal(invoked, 1);

      topic.set('v2', 1);
      assert.equal(invoked, 2);
    }
  },

  "assigned keys": {
    topic: new Glue({}),

    "can be assigned to a key": function(topic) {
      var invoked = false;

      topic.target = {};

      topic.addListener("v1", function() {
        invoked = true;
      });

      topic.set('v2', 'bar');
      assert.equal(invoked, false);

      topic.set('v1', 'baz');
      assert.equal(invoked, true);
    },

    "can be assigned do an object without a key": function(topic) {
      var invoked = false
        , obj     = { value: '' };

      topic.target = {};

      topic.addListener(obj, function(mgs) {
        obj.value = mgs.newValue;
      });

      topic.set('v1', 'baz');
      assert.equal(obj.value, 'baz');

      topic.set('v2', 'bar');
      assert.equal(obj.value, 'bar');
    },

    "can be assigned to an object with a key": function(topic) {
      var invoked = false
        , obj     = { value: '' };

      topic.target = {};

      topic.addListener('v1', obj, function(msg) {
        this.value = msg.newValue;
      });

      topic.set('v1', 'baz');
      assert.equal(obj.value, 'baz');

      topic.set('v2', 'bar');
      assert.equal(obj.value, 'baz');
    },

    "can be nested": function(topic) {
      var invoked = false;

      topic.target = { v1: {n1: 'foo'}};

      topic.addListener('v1.n1', function(msg) {
        invoked = true;
      });

      topic.set("v1.n1", "bar");
      assert.equal(invoked, true);
    }
  },

  "for computed keys": {
    topic: new Glue({}),

    "can be assigned to an anonymous function": function(topic) {
      var invoked = false;

      topic.target = {arr: [2]};

      topic.addListener('arr.#length', function() {
        invoked = true;
      });

      topic.set('arr', [2]);
      assert.equal(invoked, false);

      topic.push('arr', 2);
      assert.equal(invoked, true);
    },

    "can be assigned with a target object": function(topic) {
      var anObject = { value: 0 };

      topic.target = { v1: 0 };

      topic.addListener('arr.#length', anObject, function(msg) {
        this.value = msg.newValue;
      });

      topic.set('v1', 1);
      assert.deepEqual(anObject, {value: 1});
    }
  },

  "for key that are have functions": {

    topic: new Glue({
      arr: [],

      len: function() {
        return this.arr.length;
      }
    }),

    "can be assigned to an anonymous function": function(topic) {
      var invoked = false;

      topic.target = {arr: [2]};

      topic.addListener('arr.len()', function() {
        invoked = true;
      });

      topic.set('arr', [2]);
      assert.equal(invoked, false);

      topic.push('arr', 2);
      assert.equal(invoked, true);
    },

    "can be assigned with a target object": function(topic) {
      var anObject = { value: 0 };

      topic.target = { v1: 0 };

      topic.addListener('arr.len()', anObject, function(msg) {
        this.value = msg.newValue;
      });

      topic.set('v1', 1);
      assert.deepEqual(anObject, {value: 1});
    }
  }
});

suite.export(module);
