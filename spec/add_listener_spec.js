var vows   = require('vows')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue");

var suite  = vows.describe('addListener');

suite.addBatch({
  "assigned key": {

    topic: new Glue({v1: "", v2: ""}),

    "can be assigned to an anonymous function without any key": function(topic) {
      var invoked = 0;

      topic.addListener(function() {
        invoked++;
      });

      topic.set('v1', 1);
      assert.equal(invoked, 1);

      topic.set('v1', 1);
      assert.equal(invoked, 2);
    },

    "can be assigned to a key": function(topic) {
      var invoked = false;

      topic.addListener("v1", function() {
        invoked = true;
      });

      topic.set('v2', 'bar');
      assert.equal(invoked, false);

      topic.set('v1', 'baz');
      assert.equal(invoked, true);
    },

    "can be assigned to an object with a key": function(topic) {
      var invoked = false;

      topic.addListener('v1', {}, function(msg) {
        invoked = true;
      });

      topic.set('v2', 'bar');
      assert.equal(invoked, false);

      topic.set('v1', 'baz');
      assert.equal(invoked, true);
    },

    // "executed in the context of an object": function(topic) {
    //   var anObject = { val: '' };

    //   topic.addListener(anObject, function(msg) {
    //     this.val = msg.value;
    //   });

    //   topic.set('attr1', "executed within anObject context");
    //   assert.equal(anObject.val, "executed within anObject context");
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
