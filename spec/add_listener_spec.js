var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('addListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "for non calculated or functional keypaths": {

    topic: new Glue({foo: "bar", baz: "zap"}),

    "can be assigned to an anonymous function": function(topic) {
      var hollabackInvoked = false;

      topic.addListener(function() {
        hollabackInvoked = true;
      });

      topic.set('foo', 'zap');
      assert.equal(hollabackInvoked, true);
    },

    "can be assigned to an object": function(topic) {
      var anObject = {an: 'object'};

      topic.addListener(anObject, function(msg) {
        this.an = msg.value;
      });

      topic.set('foo', 'apple');

      assert.deepEqual(anObject, {an: 'apple'});
    },

    "can be assigned to an anonymous function with a keypath": function(topic) {
      var hollabackInvoked = false;

      topic.addListener(function() {
        hollabackInvoked = true;
      }, 'foo');

      topic.set('baz', 'bar');
      assert.equal(hollabackInvoked, false);

      topic.set('foo', 'baz');
      assert.equal(hollabackInvoked, true);
    },

    "can be assigned to an object with a keypath": function(topic) {
      var anObject = {an: 'object'};

      topic.addListener(anObject, 'foo', function(msg) {
        this.an = msg.value;
      });

      topic.set('baz', 'bar');
      assert.deepEqual(anObject, {an: 'object'});

      topic.set('foo', 'apple');
      assert.deepEqual(anObject, {an: 'apple'});
    },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.addListener(1, function(){});
      assert.equal(topic, returnedValue);
    }

  },


  "for calculated keyPaths": {

    topic: new Glue({
      internalArray: [],
    }),

    "can be assigned to an anonymous function": function(topic) {
      var hollabackInvoked = false;
      topic.set('internalArray', []);

      topic.addListener(function() {
        hollabackInvoked = true;
      }, 'internalArray.(length)');

      topic.set('internalArray', [3]);
      assert.equal(hollabackInvoked, true);
    },

    "can be assigned to an object": function(topic) {
      var anObject = {an: 'object'};
      topic.set('internalArray', []);

      topic.addListener(anObject, 'internalArray.(length)', function(msg) {
        this.an = msg.value;
      });

      topic.set('internalArray', [3]);
      assert.deepEqual(anObject, {an: 1});
    },

  },


  "for functional keyPaths": {

    topic: new Glue({
      internalArray: [],

      bar: function() {
        return this.internalArray.length;
      }
    }),

    "can be assigned to an anonymous function": function(topic) {
      var hollabackInvoked = false;
      topic.set('internalArray', []);

      topic.addListener(function() {
        hollabackInvoked = true;
      }, 'bar()');

      topic.set('internalArray', [3]);
      assert.equal(hollabackInvoked, true);
    },

    "can specify that a keypath is a function": function(topic) {
      var anObject = {an: 'object'};
      topic.set('internalArray', []);

      topic.addListener(anObject, 'bar()', function(msg) {
        this.an = msg.value;
      });

      topic.set('internalArray', [3]);
      assert.deepEqual(anObject, {an: 1});
    }

  }
});

suite.export(module);
