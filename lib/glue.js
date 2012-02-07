var _      = require('underscore');

var Glue = function(target, settings) {
  this.settings = _.defaults({hasFunc: false}, settings);

  this.target = Glue.deepClone(target, this.settings.hasFunc);
  this.cache  = Glue.deepClone(target, this.settings.hasFunc);
  this.resetListeners();
};

Glue.version = '0.5.2'

Glue.prototype.hasFunc = function(bool) {
  this.settings.hasFunc = bool;
  return this;
};

Glue.prototype.resetListeners = function() {
  this.listeners = {specific: {}, generic: {}};
};

Glue.deepClone = function(obj, effectsFunctions) {
  if (!effectsFunctions) {
    return JSON.parse(JSON.stringify(obj));
  }

  var clone;
  if (_.isArray(obj)) {
    clone = _.map(obj, function(elem) {
      return Glue.deepClone(elem, true);
    });
  } else if (typeof obj === 'object') {
    clone = {};

    _.each(obj, function(val, key) {
      clone[key] = Glue.deepClone(val, true);
    });
  } else {
    clone = obj;
  }

  return clone;
};

Glue.normalizeKey = function(key) {
  return key.replace(/\s/g, '');
};

Glue.permutateKey = function (key) {
  var keys = [],
      regIndex = /\d*(?=\]$)/,
      segments = key.split('.');

  _.each(segments, function(segment, i) {
    var k = _.first(segments, i+1).join('.');

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
      var type = key.match(/\[\]$/) ? 'generic' : 'specific';

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
      var type = key.match(/\[\]$/) ? 'generic' : 'specific';

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
// glue.notify(key, operation);
Glue.prototype.notify = function(operation, key, opts) {
  var self = this;

  _.each(this.listeners.specific, function(listeners, k) {
    var current = self.get(k),
        old     = self.get(k, self.cache);

      _.each(listeners, function(listener) {
        invoke(operation, listener, old, current);
     });
  });

  invokeGeneric(key, operation, self.cache, self.target);

  function invokeGeneric(k, operation, oldTarget, currentTarget) {
    var keysAndIndices = Glue.permutateKey(k);

    _.each(keysAndIndices, function(ki) {
      var specific = ki[0],
          generic  = ki[1],
          index    = ki[2];


      _.each(self.listeners.generic[generic], function(listener) {
        invoke(operation, listener, self.get(specific, oldTarget), self.get(specific, currentTarget), index);
      });
    });

    var affectedChildren = {};
    _.each(self.listeners.generic, function(listeners, k) {
      if (k.match(new RegExp("^" + key.replace('[', '\\\[').replace(']', '\\\]')))) {
        affectedChildren[k] = listeners;
      };
    });

    _.each(affectedChildren, function(listeners, k) {
      var base     = k.replace(/\[[^\[]*\]$/, ''),
          old      = self.get(base, oldTarget),
          current  = self.get(base, currentTarget),
          maxRange = old.length > current.length ? old.length : current.length,
          range = opts && opts.reverse ? _.range(0, maxRange).reverse() : _.range(0, maxRange);

      _.each(range, function(index) {
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
        value: currentValue
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

// Usage:
// glue.set(key, value);
Glue.prototype.set = function(key, value) {
  var lastDot     = key.lastIndexOf(".")
    , lastBracket = key.lastIndexOf("[")
    , index       = lastBracket > lastDot ? lastBracket : lastDot
    , keySuffix   = key.substring(index+1).replace(/\]/g, '');

  var current = this.get(key.substring(0, index)),
      cache   = this.get(key.substring(0, index), this.cache);

  current[keySuffix] = value;
  this.notify('set', key);
  cache[keySuffix] = Glue.deepClone(value, this.settings.hasFunc);

  return this;
};

// Usage
// glue.remove([key]);

Glue.prototype.remove = function(key){
  var removed,
      match = key.match(/\[(\d+)\]$/);

  if (match) {
    var index           = match[1]
      , suffixLastIndex = key.lastIndexOf(match[0]);

    if (suffixLastIndex === 0) {
      removed = this.target.splice(index, 1)[0];
    } else {
      removed = this.get(key.substr(0, suffixLastIndex)).splice(index, 1)[0];
    }
  } else {
    key = key.split('.');

    if (key.length > 1) {
      var top = key.pop();
      removed = this.get(key.join('.'))[top];
      delete this.get(key.join('.'))[top];
    } else {
      removed = this.target[key[0]];
      delete this.target[key[0]];
    }

    key = key.join('.');
  }

  this.notify("remove", key);
  this.cache = Glue.deepClone(this.target);

  return removed;
};

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
    self.cache = Glue.deepClone(self.target);
  };

  return this;
};

// Usage
// glue.pop([key]);
Glue.prototype.pop = function(key){
  var key = key || '',
      collection = this.get(key),
      value = collection.pop();

  this.notify("pop", key);
  this.cache = Glue.deepClone(this.target);

  return value;
};

// Usage
// glue.insert([key], index, value);
Glue.prototype.insert = function() {
  var i = 0, a = arguments;

  var key   = a.length < 3 ?  '' : a[i++],
      index = a[i++],
      value = a[i++];

  this.get(key).splice(index, 0, value);
  this.notify('insert', key);
  this.cache = Glue.deepClone(this.target);

  return this;
};

// Usage
// glue.filter([key], filterBy);

Glue.prototype.filter = function() {
  var self     = this,
      i        = 0,
      a        = arguments,
      removed  = [],
      indices,

      key      = a.length < 2 ?  '' : a[i++],
      filterBy = a[i++];

  var collection = key === '' ? this.target : self.get(key);

  indices = _.without(_.map(collection, function(value, index) {
    if (!filterBy(value)) return index;
  }), undefined).reverse();

  _.each(indices, function(index) {
    self.get(key).splice(index, 1)[0];
  });

  self.notify("filter", Glue.baseKey(key), { reverse: true });
  this.cache = Glue.deepClone(this.target);

  return this.get(Glue.baseKey(key));
};

Glue.baseKey = function(key) {
  return key.replace(/\[[^\[]*\]$/, '');
};

Glue.prototype.baseKeyAndSuffix = function(key) {
  var lastDot     = key.lastIndexOf(".")
    , lastBracket = key.lastIndexOf("[")
    , index       = lastBracket > lastDot ? lastBracket : lastDot
    , keySuffix   = key.substring(index+1).replace(/\]/g, '');

  return [this.get(key.substring(0, index)), keySuffix];
};

// Usage
// glue.sort([key], sortBy);

Glue.prototype.sortBy = function() {
  var self = this,
      i = 0, a = arguments,
      key    = a.length < 2 ?  '' : a[i++],
      sortBy = a[i++];

  collectionWithIndex = _.map(this.get(key), function(val, index) {
    return [val, index];
  });

  var sortedWithIndex = _.sortBy(collectionWithIndex, function(elem) {
    return sortBy(elem[0]);
  });

  var sorted = _.map(sortedWithIndex, function(elem) { return elem[0] });

  if (key === '') {
    this.target = sorted;
  } else {
    bs = this.baseKeyAndSuffix(key);
    bs[0][bs[1]] = sorted;
  };

  var indices = _.map(sortedWithIndex, function(elem) {
    return elem[1];
  });

  this.notify("filter", Glue.baseKey(key), { reverse: true });
  this.cache = Glue.deepClone(this.target);

  return sorted;
};

// Usage
// glue.swap(loc1, loc2);
Glue.prototype.swap = function(loc1, loc2) {
  var self = this,
      value1 = this.get(loc1),
      value2 = this.get(loc2),
      bs1 = this.baseKeyAndSuffix(loc1),
      bs2 = this.baseKeyAndSuffix(loc2);

  bs1[0][bs1[1]] = value2;
  bs2[0][bs2[1]] = value1;

  _.each(_.uniq(_.union(Glue.baseKey(loc1), Glue.baseKey(loc2))), function(key) {
    self.notify("swap", key);
  });

  this.cache = Glue.deepClone(this.target);
  return this;
};

module.exports = Glue;
