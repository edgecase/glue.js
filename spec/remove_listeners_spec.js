var vows = require('vows')
,   _ = require('underscore')
,   assert = require('assert')
,   Glue   = require(__dirname + "/../lib/glue")

,   suite = vows.describe('removeListener');

// Removes listener for a specific key/operation combination or context object
//
// Usage:
// glue.removeListener((key(s):operation(s)), [context]);
//
// key(s) (optional):
//
// operations(s) (optional):
//
// context (optional):
//
// Examples
// glue.removeListener('v1')
// glue.removeListener(':set')
// glue.removeListener('set:pop')
// glue.removeListener(obj)
// glue.removeListener(arr, obj)
// glue.removeListener(arr:pop, obj)
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
      glue.addListener(function() {});
      glue.addListener('v1', function() {});
      glue.addListener('v1:ops1', function() {});
      glue.addListener({a: 'context'}, function() {});
      glue.addListener('v1', {a: 'context'}, function() {});
      glue.addListener('v1:ops1', {a: 'context'}, function() {});

      glue.removeListener();
      assert.deepEqual(glue.listeners.specific, {});
    },

    "removes all listeners": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // remove
      glue.addListener(callback);
      glue.addListener({a: 'context'}, callback);

      // keep
      glue.addListener('v1', callback);
      glue.addListener('v1:ops1', callback);
      glue.addListener('v1', {a: 'context'}, callback);
      glue.addListener('v1:ops1', {a: 'context'}, callback);

      glue.removeListener('');
      assert.deepEqual(glue.listeners.specific, {});
    },

    "removes a key": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // keep
      glue.addListener(callback);
      glue.addListener({a: 'context'}, callback);

      // remove
      glue.addListener('v1', callback);
      glue.addListener('v1:ops1', callback);
      glue.addListener('v1', {a: 'context'}, callback);
      glue.addListener('v1:ops1', {a: 'context'}, callback);

      glue.removeListener('v1');
      assert.deepEqual(glue.listeners.specific['*'].length, 2);
      assert.deepEqual(glue.listeners.specific['v1'], undefined);
    },

    "removes a key with operation": function(glue) {
      var callback = function() {};

      glue.resetListeners();

      // keep
      glue.addListener(callback);
      glue.addListener({a: 'context'}, callback);
      glue.addListener('v1', callback);
      glue.addListener('v1', {a: 'context'}, callback);

      // remove
      glue.addListener('v1:ops1', callback);
      glue.addListener('v1:ops1', {a: 'context'}, callback);

      glue.removeListener('v1:op1');
      assert.deepEqual(glue.listeners.specific['*'].length, 2);
      assert.deepEqual(glue.listeners.specific['v1'].length, 2);
    },

    "removes a key with operation and context": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addListener(callback);
      glue.addListener('v1:ops1', callback);
      glue.addListener('v1', callback);

      // remove
      glue.addListener('v1:ops1', context, callback);
      glue.addListener(context, callback);
      glue.addListener('v1', context, callback);

      glue.removeListener(':ops1', context);

      assert.equal(glue.listeners.specific['*'].length, 1);
      assert.equal(glue.listeners.specific['v1'].length, 2);
    },

    "removes an operation and context": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addListener(callback);
      glue.addListener('v1', callback);
      glue.addListener('v1:ops1', callback);

      // remove
      glue.addListener(context, callback);
      glue.addListener('v1', context, callback);
      glue.addListener('v1:ops1', context, callback);

      glue.removeListener(':ops1', context);

      assert.equal(glue.listeners.specific['*'].length, 1);
      assert.equal(glue.listeners.specific['v1'].length, 2);
    },

    "removes generic keys": function(glue) {
      var callback = function() {},
          context  = { a: 'context'};

      glue.resetListeners();

      // keep
      glue.addListener('v1', context, callback);

      // remove
      glue.addListener('[]', context, callback);
      glue.addListener('[]:set', context, callback);

      glue.removeListener('[]:set', context);

      assert.deepEqual(glue.listeners.specific['v1'].length, 1);
      assert.deepEqual(glue.listeners.generic, {});
    }
  },
});

suite.export(module)
