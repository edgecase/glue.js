var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('addListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "for assigned key": {

    topic: new Glue({attr1: "val1", attr2: "val2"}),

    "can be assigned to an anonymous function without a key": function(topic) {
      var invocations = 0;

      topic.addListener(function() {
        invocations++;
      });

      topic.set('attr1', 'something');
      assert.equal(invocations, 1);

      topic.set('attr2', 'something');
      assert.equal(invocations, 2);
    },

    // "executed in the context of an object": function(topic) {
    //   var anObject = { val: '' };

    //   topic.addListener(anObject, function(msg) {
    //     this.val = msg.value;
    //   });

    //   topic.set('attr1', "executed within anObject context");
    //   assert.equal(anObject.val, "executed within anObject context");
    // },

    // "can be assigned to an anonymous function for a keypath specific keypath": function(topic) {
    //   var callbackInvoked = false;

    //   topic.addListener(function() {
    //     callbackInvoked = true;
    //   }, 'attr1');

    //   topic.set('attr2', 'bar');
    //   assert.equal(callbackInvoked, false);

    //   topic.set('attr1', 'baz');
    //   assert.equal(callbackInvoked, true);
    // },

    // "can be assigned to an object with a keypath": function(topic) {
    //   var anObject = {an: 'object'};

    //   topic.addListener(anObject, 'foo', function(msg) {
    //     this.an = msg.value;
    //   });

    //   topic.set('baz', 'bar');
    //   assert.deepEqual(anObject, {an: 'object'});

    //   topic.set('foo', 'apple');
    //   assert.deepEqual(anObject, {an: 'apple'});
    // },

    // "when invoked, returns itself for chainability": function(topic) {
    //   var returnedValue = topic.addListener(1, function(){});
    //   assert.equal(topic, returnedValue);
    // }

  },

  "for computed keyPaths": {
    topic: new Glue({ arr: [] }),

    // "can be assigned to an anonymous function": function(topic) {
    //   var callbackInvoked = false;
    //   topic.set('arr', []);

    //   topic.addListener(function() {
    //     callbackInvoked = true;
    //   }, 'arr.(length)');

    //   topic.set('arr', [3]);
    //   assert.equal(callbackInvoked, true);
    // },

    // "can be assigned to an object": function(topic) {
    //   var anObject = {an: 'object'};
    //   topic.set('internalArray', []);

    //   topic.addListener(anObject, 'internalArray.(length)', function(msg) {
    //     this.an = msg.value;
    //   });

    //   topic.set('internalArray', [3]);
    //   assert.deepEqual(anObject, {an: 1});
    // },

  },

  "for functional keyPaths": {

    topic: new Glue({
      internalArray: [],

      bar: function() {
        return this.internalArray.length;
      }
    }),

    // "can be assigned to an anonymous function": function(topic) {
    //   var callbackInvoked = false;
    //   topic.set('internalArray', []);

    //   topic.addListener(function() {
    //     callbackInvoked = true;
    //   }, 'bar()');

    //   topic.set('internalArray', [3]);
    //   assert.equal(callbackInvoked, true);
    // },

    // "can specify that a keypath is a function": function(topic) {
    //   var anObject = {an: 'object'};
    //   topic.set('internalArray', []);

    //   topic.addListener(anObject, 'bar()', function(msg) {
    //     this.an = msg.value;
    //   });

    //   topic.set('internalArray', [3]);
    //   assert.deepEqual(anObject, {an: 1});
    // }

  }
});

suite.export(module);
