var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('removeListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "all key": {
    topic: new Glue({}),

   "removes all listeners if no key is passed": function(topic) {
      var invoked = false;

      topic.target = {v1: '', v2: ''};

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
    },

    "removes all listeners of an object is the object is passed": function(topic) {
      var obj1 = { arr: []}
        , obj2 = { arr: []};

      topic.target = { v1: ''};

      topic.addListener(obj1, function() {
        this.arr.push(1);
      });

      topic.addListener('v1', obj1, function() {
        this.arr.push(1);
      });

      topic.addListener('v1#length', obj1, function() {
        this.arr.push(1);
      });

      topic.addListener(obj2, function() {
        this.arr.push(1);
      });

      topic.addListener('v1', obj2, function() {
        this.arr.push(1);
      });

      topic.addListener('v1#length', obj2, function() {
        this.arr.push(1);
      });

      topic.removeListener(obj2);
      topic.set('v1', 'set');

      assert.deepEqual(obj1.arr, [1, 1, 1]);
      assert.deepEqual(obj2.arr, []);
    }
  },

  "any key": {
    topic: new Glue({v1: ''}),

    "removes all listeners": function(topic) {
      var invoked = [];

      topic.addListener(function() {
        invoked.push(1);
      });

      topic.addListener('v1', function() {
        invoked.push(1);
      });

      topic.addListener('v1#length', function() {
        this.arr.push(1);
      });

      topic.removeListener('*');
      topic.set('v1', 'set');

      assert.deepEqual(invoked, []);
    },
  },

  "assigned key": {
    topic: new Glue({}),

    "can be removed for a key": function(topic) {
      var invoked = [];

      topic.target = { v1: '' };

      topic.addListener('v1', function() {
        invoked.push(1);
      });

      topic.removeListener('v1');

      topic.set('v1', 'set');

      assert.deepEqual(invoked, []);
    },

    "can be remove for a specific key and target": function(topic) {
      var obj = {an: 'obj'}
        , invoked1 = false
        , invoked2 = false;

      topic.target = { v1: '' };

      topic.addListener('v1', function() {
        invoked1 = true
      });

      topic.addListener('v1', obj, function() {
        invoked2 = true
      });

      topic.removeListener('v1', obj);

      topic.set('v1', 'set');

      assert.equal(invoked1, true);
      assert.equal(invoked2, false);
    }
  },

  "computed key": {
    topic: new Glue({}),

    "can be removed for a key": function(topic) {
      var invoked = [];

      topic.target = { arr: [] };

      topic.addListener('arr#length', function() {
        invoked.push(1);
      });

      topic.removeListener('arr#length');
      topic.push('arr', 1);

      assert.deepEqual(invoked, []);
    },

    "can be remove for a specific key and target": function(topic) {
      var obj = {an: 'obj'}
        , invoked1 = false
        , invoked2 = false;

      topic.target = { arr: [] };

      topic.addListener('arr#length', function() {
        invoked1 = true
      });

      topic.addListener('arr#length', obj, function() {
        invoked2 = true
      });

      topic.removeListener('arr#length', obj);

      topic.push('arr', 1);

      assert.equal(invoked1, true);
      assert.equal(invoked2, false);
    }
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
