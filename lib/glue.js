var _      = require('underscore');

// Glue is an object listener library for javascript.
//
// For example, the value of 'v1' of hash:
// {v1: 'value'}
//
// Can be observe with key:
// "v1"
//
// Objects can be arbitrarily complex. For example, one can observe 'value'
// within this structure:
//
// {v1: arr1: [{v2: v3: arr2: ['value']}]}
//
// with the key:
// 'v1.arr1[0].v2.v3.arr2[0]'
//
// Similarly one can observe an arbitrary element of arr2 with the key:
// 'v1.arr1[0].v2.v3.arr2[]'
//
// And of course one can observe the array itself with the key:
// 'v1.arr1[0].v2.v3.arr'
//
// Possible values for key:
// '*':               any key
// 'v1':              target: {v1: 'foo'}
// 'v1.v2':           target: {v1: {v2: {...}}
// '[]':              target: []
// 'arr':             target: {arr: []}                 * the array itself
// 'arr[]':           target: {arr: []}                 * targets the elements of the array
// 'v1.arr:           target: {v1: {arr: []}}
// 'arr[i].v1.arr     target: {arr: [{v1: arr: []}]}
// 'arr[i].v1.arr[]   target: {arr: [{v1: arr: []}]}
//
// And any other permutations of the combinations describe
// above nested n layers deep (ex. 'v1.v2.v3.arr[i].v4 ...)

var Glue = function(target) {
  this.target = target;

  this.updateCache();
  this.resetListeners();
};

Glue.version = '0.5.0'

Glue.prototype.resetListeners = function() {
  this.listeners = {specific: {}, generic: {}};
};

Glue.deepClone = function(obj) {
  var clone;

  if (_.isArray(obj)) {
    clone = _.map(obj, function(elem) {
      return Glue.deepClone(elem);
    });
  } else if (typeof obj === 'object') {
    clone = {};

    _.each(obj, function(val, key) {
      clone[key] = Glue.deepClone(val);
    });
  } else {
    clone = obj;
  }

  return clone;
};

Glue.prototype.updateCache = function() {
  this.cache = Glue.deepClone(this.target);
};

Glue.normalizeKey = function(key) {
  return key.replace(/\s/g, '');
};

Glue.permutateKey = function (key) {
  var keys = [],
      segments = key.split('.');

  _.each(segments, function(segment, i) {
    var k        = _.first(segments, i+1).join('.'),
        regIndex = /\d*(?=\]$)/;

    if (k.match(regIndex)) {
      keys.push([k, k.replace(regIndex, ''), parseInt(k.match(regIndex)[0])]);
    }
  });

  return keys.reverse();
};

Glue.keysAndOperations = function(ko) {
  if (arguments.length === 0) return [[], []];

  var k = Glue.normalizeKey(ko).split(':'),
      keys = _.isEmpty(k[0]) ? [''] : k[0].split(','),
      operations = _.isEmpty(k[1]) ? [] : k[1].split(',');

  return [keys, operations];
};

// Usage:
// glue.addListener([key(s):operation(s)], [context], callback)

Glue.prototype.addListener = function() {
  var self = this,
      a    = arguments;

  if (a.length === 1) {
    add('*', a[0], this.target);
  } else if (a.length === 2) {
    _.isString(a[0]) ? add(a[0], a[1], this.target) : add('*', a[1], a[0]);
  } else {
    add(a[0], a[2], a[1]);
  }

  function add(k, callback, context) {
    var ko         = Glue.keysAndOperations(k),
        keys       = _.isEqual(ko[0], ['']) ? ['*'] : ko[0],
        operations = ko[1];

    _.each(keys, function(key) {
      var type = key.match(/\]$/) ? 'generic' : 'specific';

      self.listeners[type][key] = self.listeners[type][key] || [];

      self.listeners[type][key].push({
        callback: callback, operations: operations, context: context
      });
    });
  }
};

// Usage:
// glue.removeListener((key(s):operation(s)), [context]);
Glue.prototype.removeListener = function() {
  var self = this,
      a    = arguments;

  if(a.length === 0) {
    remove('');
  } else if (a.length === 1) {
    _.isString(a[0]) ? remove(Glue.normalizeKey(a[0])) : remove('', a[0]);
  } else if (a.length === 2) {
    remove(Glue.normalizeKey(a[0]), a[1]);
  }

  function remove(k, context) {
    var ko         = Glue.keysAndOperations(k),
        operations = ko[1],
        keys;

    if (_.isEqual(ko[0], [''])) {
      keys = _.union(_.keys(self.listeners.specific), _.keys(self.listeners.generic));
    } else {
      keys = ko[0];
    }

    _.each(keys, function(key) {
      var type = key.match(/\]$/) ? 'generic' : 'specific';

      if(!_.isEmpty(operations)) {
        _.each(self.listeners[type][key], function(listener) {
          listener.operations = _.difference(listener.operations, operations);
        });
      }

      self.listeners[type][key] = _.reject(self.listeners[type][key], function(listener) {
        if (!_.isEmpty(operations) && context) {
          return _.isEmpty(listener.operations) && listener.context === context;
        } else if (context) {
          return listener.context === context;
        } else if (!_.isEmpty(operations)) {
          return _.isEmpty(listener.operations);
        } else {
          return true;
        }
      });

      if (_.isEmpty(self.listeners[type][key])) delete self.listeners[type][key];
    });
  };
};

// Not in the public API.
//
// Usage:
// glue.notify([key], operation, original, current, changes);

Glue.prototype.notify = function(operation, key) {
  var self = this;

  _.each(this.listeners.specific, function(listeners, k) {
    var current = self.get(k),
        old     = self.get(k, self.cache);

      _.each(listeners, function(listener) {
        invoke(operation, listener, old, current);
     });
  });

  if (key === '' || key.match(/\]$/)) invokeGeneric(key, operation, self.cache, self.target);

  this.updateCache();

  function invokeGeneric(k, operation, oldTarget, currentTarget) {
    var keysAndIndices = Glue.permutateKey(k);

    _.each(keysAndIndices, function(ki) {
      var specific = ki[0], generic = ki[1], index = ki[2];

      _.each(self.listeners.generic[generic], function(listener) {
        invoke(operation, listener, self.get(specific, oldTarget), self.get(specific, currentTarget), index);
      });
    });

    var affectedChildren = {};
    _.each(self.listeners.generic, function(listeners, k) {
      if (key.match(new RegExp("^" + key.replace('[', '\\\[').replace(']', '\\\]')))) {
        affectedChildren[k] = listeners;
      };
    });

    _.each(affectedChildren, function(listeners, k) {
      var base    = k.replace(/\[[^\[]*\]$/, ''),
          old = self.get(base, oldTarget),
          current = self.get(base, currentTarget),
          maxRange = old.length > current.length ? old.length : current.length;

      _.each(_.range(0, maxRange), function(index) {
        var oldValue = old[index],
            currentValue = current[index];

        _.each(listeners, function(listener) {
          invoke(operation, listener, oldValue, currentValue, index);
        });
      });
    });
  };

  function invoke(operation, listener, oldValue, currentValue, index) {
    if (!_.isEqual(oldValue, currentValue)) {
      var message = {
        operation: operation,
        oldValue: oldValue,
        currentValue: currentValue
      };

      if (!_.isUndefined(index)) message.index = index;

      if (!_.isEmpty(listener.operations)) {
        if (_.include(listener.operations, operation)) callListener(listener, message);
      } else {
        callListener(listener, message);
      }
    }
  };

  function callListener(listener, message) {
    listener.callback.call(listener.context, message);
  };
};

// Type: Scalar/Collection
//
// Not in the public API. It is more performant to access
// values directly through glue.target. However, one should never
// modify the values of a target object obtain directly from
// glue.target.
//
// Usage:
// glue.get([key], [obj]);

Glue.prototype.get = function(key, obj) {
  if (key === '' || key === '*') return obj || this.target;

  var target = obj || this.target;

  key = Glue.normalizeKey(key);
  key = (_.isArray(target) ? "target" : "target.") + key;

  return eval(key); // I know eval is generally evil, but I think it's acceptable for this use case.
};

// Type: Scalar/Collection
//
// Usage:
// glue.set(key, value);
Glue.prototype.set = function(key, value) {
  var lastDot     = key.lastIndexOf(".")
    , lastBracket = key.lastIndexOf("[")
    , index       = lastBracket > lastDot ? lastBracket : lastDot
    , keySuffix   = key.substring(index+1).replace(/\]/g, '');

  var base = this.get(key.substring(0, index));
  base[keySuffix] = value;

  this.notify('set', key);

  return this;
};

// Type: Collection
//
// Usage
// topic.push([key], value);

Glue.prototype.push = function() {
  var self = this,
      a = arguments;

  if (a.length === 1) {
    push('', this.target, a[0]);
  } else {
    push(a[0], self.get(a[0]), a[1]);
  }

  function push(key, collection, item) {
    collection.push(item);
    self.notify("push", key);
  };

  return this;
};

// Type: Collection
//
// Usage
// glue.pop([key]);

Glue.prototype.pop = function(key){
  var key = key || '',
      collection = this.get(key),
      value = collection.pop();

  this.notify("pop", key);

  return value;
};

// Type: Collection
//
// Usage
// glue.insert([key], index, value);

Glue.prototype.insert = function() {
  var i = 0, a = arguments;

  var key   = a.length < 3 ?  '' : a[i++],
      index = a[i++],
      value = a[i++];

  this.get(key).splice(index, 0, value);
  this.notify('insert', key);

  return this;
};

module.exports = Glue;
