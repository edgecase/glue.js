var vows = require('vows')
,   util = require('util')
,   assert = require('assert')

,   suite = vows.describe('Glue private functions')
,   Glue = require("../lib/glue");

suite.addBatch({
  "set": {
    topic: new Glue({level1: ''}),

    "simple assignment": function(topic) {
      topic.set('level1', 'top level');
      assert.equal(topic.getBoundObject().level1, "top level");
    },

    "nested assignment": function() {
      var topic = new Glue({level1: {level2: ''}});

      topic.set('level1.level2', 'two levels');
      assert.equal(topic.getBoundObject().level1.level2, "two levels");
    },

    "deeply nested assignment": function() {
      var topic = new Glue({level1: {level2: {level3: ''}}});

      topic.set('level1.level2.level3', 'three levels');
      assert.equal(topic.getBoundObject().level1.level2.level3, "three levels");
    },

    "invocation returns itself for chainability": function(topic) {
      var returnedValue = topic.set('level1', 'top level');
      assert.equal(topic, returnedValue);
    }
  },
});

suite.addBatch({
  "get": {

    "a property": function(topic) {
      var topic = new Glue({foo: 'bar'});

      assert.equal(topic.get("foo"), "bar");
    },

    "a nested property": function(topic) {
      var topic = new Glue({foo: {bar: 'baz'}});

      assert.equal(topic.get("foo.bar"), "baz");
    },

    "a deeply property": function(topic) {
      var topic = new Glue({foo: {bar: {baz: 'zap'}}});

      assert.equal(topic.get("foo.bar.baz"), "zap");
    }
  }
});

suite.addBatch({
  "get with calculated keypath": {

    "a calculated property": function(topic) {
      var topic = new Glue({foo: 'bar'});

      assert.equal(topic.get("(foo)"), "bar");
    },

    "a nested calculated property": function(topic) {
      var topic = new Glue({foo: {bar: 'baz'}});

      assert.equal(topic.get("foo.(bar)"), "baz");
    },

    "a chained calculated property": function(topic) {
      var topic = new Glue({foo: {bar: 'baz'}});

      assert.equal(topic.get("(foo).bar"), "baz");
    }
  }
});

suite.addBatch({
  "getBoundObject": {
    topic: new Glue({foo: 1}),

    "returns a copy of the bound object": function(topic) {
      assert.deepEqual(topic.getBoundObject(), {foo: 1});
    },

    "manipulating object returned should not returned the actual bound object": function(topic) {
      var boundObject = topic.getBoundObject();

      boundObject.foo = 2;
      assert.deepEqual(topic.boundObject, {foo: 1});
      assert.notDeepEqual(topic.boundObject, {foo: 2});
    }
  }
});

suite.addBatch({
  "addObserver": {
    topic: new Glue({foo: "bar", baz: "zap"}),

    "can be assigned to an anonymous function": function(topic) {
      var listenerHollaBackWasInvoked = false;

      topic.addObserver(function() {
        listenerHollaBackWasInvoked = true;
      });

      topic.set("foo", "baz");
      assert.equal(listenerHollaBackWasInvoked, true);
    },

    "can be assigned to an object": function(topic) {
      var listenerHollaBackWasInvoked = false;

      topic.addObserver({an: 'object'}, function() {
        listenerHollaBackWasInvoked = true;
      });

      topic.set("baz", "baz");
      assert.equal(listenerHollaBackWasInvoked, true);
    },

    "can be assigned to an anonymous function with a keypath": function(topic) {
      var listenerHollaBackWasInvoked = false;

      topic.addObserver(function() {
        listenerHollaBackWasInvoked = true;
      }, 'foo');

      topic.set("baz", "baz");
      assert.equal(listenerHollaBackWasInvoked, false);

      topic.set("foo", "baz");
      assert.equal(listenerHollaBackWasInvoked, true);
    },

    "can be assigned to an object with a keypath": function(topic) {
      var listenerHollaBackWasInvoked = false;

      topic.addObserver({an: 'object'}, 'foo', function() {
        listenerHollaBackWasInvoked = true;
      });

      topic.set("baz", "baz");
      assert.equal(listenerHollaBackWasInvoked, false);

      topic.set("foo", "baz");
      assert.equal(listenerHollaBackWasInvoked, true);
    }
  }
});


// suite.addBatch({
//   "addObserver with calculated and funtion keypath": {
//     topic: new Glue({
//       internalArray: [],
// 
//       foo: this.internalArray.length,
// 
//       bar: function() {
//         return this.internalArray.length;
//       }
//     }),
// 
//     "can specify that a keypath is calculated": function(topic) {
//       var listenerHollaBackWasInvoked = false;
// 
//       topic.addObserver(myObj, '(foo)', function() {
//         listenerHollaBackWasInvoked = true;
//       });
// 
//       topic.set('internalArray' = []);
//       assert.equal(listenerHollaBackWasInvoked, false);
// 
//       topic.set('internalArray' = [3]);
//       assert.equal(listenerHollaBackWasInvoked, true);
//     },
// 
//     "can specify that a keypath is a function": function(topic) {
//       var listenerHollaBackWasInvoked = false;
// 
//       topic.addObserver(myObj, 'foo()', function() {
//         listenerHollaBackWasInvoked = true;
//       });
// 
//       topic.set('internalArray' = []);
//       assert.equal(listenerHollaBackWasInvoked, false);
// 
//       topic.set('internalArray' = [3]);
//       assert.equal(listenerHollaBackWasInvoked, true);
//     }
//   }
// });

suite.export(module);
