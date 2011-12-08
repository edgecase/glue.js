var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('removeListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "": {
    topic: new Glue({
        arr: []
      , attr: 1
      , len: function() {
          return this.arr.length;
        }
    }),

    "removes all listeners if no arguments are passed": function(topic) {
      var callbackInvoked = false;

      topic.addListener({}, "arr", function() {
        callbackInvoked = true;
      });
      topic.addListener({}, "(len)", function() {
        callbackInvoked = true;
      });

      topic.removeListener();
      topic.set('arr', [3]);

      assert.deepEqual(callbackInvoked, false);
    },

    "removes all listerners of a target object is anypath is specified": function(topic) {
      var anObject1 = [];

      topic.addListener(anObject1, function() {
        this.push('a');
      });

      topic.addListener(anObject1, "attr", function() {
        this.push('c');
      });

      topic.addListener(anObject1, "len()", function() {
        this.push('b');
      });

      topic.removeListener("*", anObject1);

      topic.set("arr, attr", [3]);

      assert.deepEqual(anObject1, []);
    },

    // "removes by target object and keypath": function(topic) {
    //   var anObject = {an: 'object'};
    //   topic.set("internalArray", []);

    //   topic.addListener(anObject, function() {
    //     this.an = 'orange';
    //   });

    //   topic.addListener(anObject, "bar()", function() {
    //     this.an = 'apple';
    //   });

    //   topic.removeListener(anObject, "bar()");

    //   topic.set("internalArray", [3]);
    //   assert.deepEqual(anObject, {an: 'orange'});
    // },

    // "removes by keypath": function(topic) {
    //   var anObject = {an: 'object'};
    //   topic.set("internalArray", []);

    //   topic.addListener(anObject, "internalArray", function() {
    //     this.an = "orange";
    //   });

    //   topic.addListener(anObject, "bar()", function() {
    //     this.an = "apple";
    //   });

    //   topic.removeListener({keyPath: "bar()"});

    //   topic.set("internalArray", [3]);
    //   assert.deepEqual(anObject, {an: 'orange'});
    // },

    "when invoked, returns itself for chainability": function(topic) {
      var returnedValue = topic.removeListener();
      assert.equal(topic, returnedValue);
    }
  }
});

suite.export(module);
