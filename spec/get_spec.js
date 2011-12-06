var vows = require('vows')
,   assert = require('assert')

,   suite = vows.describe('get')
,   Glue = require(__dirname + "/../lib/glue");

suite.addBatch({
  "non calculated properties": {

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
  },

  // The use of "(" and ")" to get calculated attribute is there for
  // the convinience of the developer, but it is indeed equivalent a normal
  // keypath.
  //
  // For example getting keypath "foo" is equivalent to getting "(foo)", or
  // "foo.(bar)" and "(foo).bar" and so forth

  "get with calculated keypath": {

    "a functional property": function(topic) {
      var topic = new Glue({
        foo: (function() {
          return 3;
        })()
      });

      assert.equal(topic.get("(foo)"), 3);
    },

    "a nested calculated property": function(topic) {
      var topic = new Glue({
        foo: {
          bar: (function() {
            return 3;
          })()
        }
      });

      assert.equal(topic.get("foo.(bar)"), 3);
    },

    "a nested calculated property": function(topic) {
      var topic = new Glue({
        foo: {
          bar: (function() {
            return { baz: 3 };
          })()
        }
      });

      assert.equal(topic.get("foo.(bar).baz"), 3);
    },

    "a chained calculated property": function(topic) {
      var topic = new Glue({
        foo: (function() {
          return { bar: 3 };
        })()
      });

      assert.equal(topic.get("(foo).bar"), 3);
    }

  },

  // Developers should only set keyPaths to functions whose invocation
  // has no side effects.
  //
  // ex. count()
  //
  // not
  //
  // somethingThatWillChangeTheObjectsState()
  //
  // If you set a keypath to somethingThatWillChangeTheObjectsState()
  // getting "somethingThatWillChangeTheObjectsState()" can change
  // attributes in the objects but will not notify listeners

  "get with functional keypath": {

    "a functional property": function(topic) {
      var topic = new Glue({
        foo: function() {
          return 3;
        }
      });

      assert.equal(topic.get("foo()"), 3);
    },

    "a nested calculated property": function(topic) {
      var topic = new Glue({
        foo: {
          bar: function() {
            return 3;
          }
        }
      });

      assert.equal(topic.get("foo.bar()"), 3);
    },

    "a chained calculated property": function(topic) {
      var topic = new Glue({
        foo: function() {
          return { bar: 3 };
        }
      });

      assert.equal(topic.get("foo().bar"), 3);
    },

    "a complex chained calculated property": function(topic) {
      var topic = new Glue({
        foo: {
          bar: function() {
            return { baz: 3 };
          }
        }
      });

      assert.equal(topic.get("foo.bar().baz"), 3);
    }
  }
});

suite.export(module);
