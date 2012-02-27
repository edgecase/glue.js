var vows = require('vows')
,   _ = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('remove observer');

// Removes listener for a specific key/operation combination or context object
//
// Usage:
// glue.removeObserver((key(s):operation(s)), [context]);
//
// key(s) (optional):
//
// operations(s) (optional):
//
// context (optional):
//
// Examples
// glue.removeObserver('v1')
// glue.removeObserver(':set')
// glue.removeObserver('set:pop')
// glue.removeObserver(obj)
// glue.removeObserver(arr, obj)
// glue.removeObserver(arr:pop, obj)
var numberOfListeners = function(glue) {
  return _.reduce(glue.listeners, function(memo, listenerSet) {
    return memo + listenerSet.length;
  }, 0);
};

suite.addBatch({
  "removing": {
    topic: new Glue({v1: ''}),

    "removes all (implicit)": function(glue) {
      glue.resetListeners();

      // remove
      glue.addObserver(function() {});
      glue.addObserver('v1', function() {});
      glue.addObserver('v1:ops1', function() {});
      glue.addObserver({a: 'context'}, function() {});
      glue.addObserver('v1', {a: 'context'}, function() {});
      glue.addObserver('v1:ops1', {a: 'context'}, function() {});

      glue.removeObserver();
      assert.deepEqual(glue.listeners.specific, {});
    },

    "removes all listeners": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // remove
      glue.addObserver(callback);
      glue.addObserver({a: 'context'}, callback);

      // keep
      glue.addObserver('v1', callback);
      glue.addObserver('v1:ops1', callback);
      glue.addObserver('v1', {a: 'context'}, callback);
      glue.addObserver('v1:ops1', {a: 'context'}, callback);

      glue.removeObserver('');
      assert.deepEqual(glue.listeners.specific, {});
    },

    "removes a key": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // keep
      glue.addObserver(callback);
      glue.addObserver({a: 'context'}, callback);

      // remove
      glue.addObserver('v1', callback);
      glue.addObserver('v1:ops1', callback);
      glue.addObserver('v1', {a: 'context'}, callback);
      glue.addObserver('v1:ops1', {a: 'context'}, callback);

      glue.removeObserver('v1');
      assert.deepEqual(glue.listeners.specific['*'].length, 2);
      assert.deepEqual(glue.listeners.specific['v1'], undefined);
    },

    "removes a key with operation": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // keep
      glue.addObserver(callback);
      glue.addObserver({a: 'context'}, callback);
      glue.addObserver('v1', callback);
      glue.addObserver('v1', {a: 'context'}, callback);

      // remove
      glue.addObserver('v1:ops1', callback);
      glue.addObserver('v1:ops1', {a: 'context'}, callback);

      glue.removeObserver('v1:op1');
      assert.deepEqual(glue.listeners.specific['*'].length, 2);
      assert.deepEqual(glue.listeners.specific['v1'].length, 2);
    },

    "removes a key with operation and context": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addObserver(callback);
      glue.addObserver('v1:ops1', callback);
      glue.addObserver('v1', callback);

      // remove
      glue.addObserver('v1:ops1', context, callback);
      glue.addObserver(context, callback);
      glue.addObserver('v1', context, callback);

      glue.removeObserver(':ops1', context);

      assert.equal(glue.listeners.specific['*'].length, 1);
      assert.equal(glue.listeners.specific['v1'].length, 2);
    },

    "removes an operation and context": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addObserver(callback);
      glue.addObserver('v1', callback);
      glue.addObserver('v1:ops1', callback);

      // remove
      glue.addObserver(context, callback);
      glue.addObserver('v1', context, callback);
      glue.addObserver('v1:ops1', context, callback);

      glue.removeObserver(':ops1', context);

      assert.equal(glue.listeners.specific['*'].length, 1);
      assert.equal(glue.listeners.specific['v1'].length, 2);
    },

    "removes generic keys": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addObserver('v1', context, callback);

      // remove
      glue.addObserver('[]', context, callback);
      glue.addObserver('[]:set', context, callback);

      glue.removeObserver('[]:set', context);

      assert.deepEqual(glue.listeners.specific['v1'].length, 1);
      assert.deepEqual(glue.listeners.generic, {});
    }
  },
});

suite.export(module)
