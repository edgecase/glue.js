var vows = require('vows')
,   assert = require('assert')
,   util = require('util')

,   suite = vows.describe('removeListener')
,   Glue = require("../lib/glue");

suite.addBatch({
  "non calculated keyPaths": {
    topic: new Glue({
      internalArray: [],

      bar: function() {
        return this.internalArray.length;
      }
    }),

    "removes all listeners if no arguments are passed": function(topic) {
      var hollabackInvoked = false;
      topic.set('internalArray', []);

      topic.addListener({my: "listener1"}, "foo", function() {
        hollabackInvoked = true;
      });
      topic.addListener({my: "listener2"}, "bar()", function() {
        hollabackInvoked = true;
      });

      topic.removeListener();

      topic.set('internalArray', [3]);
    },

    "removes by target object": function(topic) {
      var anObject1 = {an: 'object'},
          anObject2 = {an: 'object'};

      topic.set("internalArray", []);

      topic.addListener(anObject1, function() {
        this.an = 'orange';
      });

      topic.addListener(anObject2, "bar()", function() {
        this.an = 'apple';
      });

      topic.removeListener(anObject1);

      topic.set("internalArray", [3]);

      assert.deepEqual(anObject1, {an: 'object'});
      assert.deepEqual(anObject2, {an: 'apple'});
    },

    "removes by target object and keypath": function(topic) {
      var anObject = {an: 'object'};
      topic.set("internalArray", []);

      topic.addListener(anObject, function() {
        this.an = 'orange';
      });

      topic.addListener(anObject, "bar()", function() {
        this.an = 'apple';
      });

      topic.removeListener(anObject, "bar()");

      topic.set("internalArray", [3]);
      assert.deepEqual(anObject, {an: 'orange'});
    }
  }
});

suite.export(module);
