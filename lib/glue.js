var _ = require('underscore');

var Glue = function(target) {
  this.target = target;

  this.resetListeners = function() {
    this.listeners = {
      any: [],
      assigned: {},
      computed: {},
      oldComputedValues: {}
    };
  }

  this.resetListeners();

  this.get = function() {
    key = _.map(Array.prototype.slice.call(arguments), function(key) {
      return key.replace(/\#/,'.');
    }).join('.').replace(/\s/g,'');

    return eval(key.length > 0 ? "this.target." + key : "this.target");
  };
};

Glue.version = '0.4.0'

Glue.normalizeKey = function(key) {
  return key.replace(/\#/g,'.').replace(/\]|\s/g,'');
};

Glue.prototype.set = function(keys, value, callback) {
  var self = this;

  _.each(keys.split(','), function(key) {
    var lastDot     = key.lastIndexOf(".")
      , lastBracket = key.lastIndexOf("[")
      , index       = lastBracket > lastDot ? lastBracket : lastDot
      , keySuffix   = Glue.normalizeKey(key.substring(index+1));

    var base = self.get(key.substring(0, index));

    self.notify(key, {
        operation: 'set'
      , oldValue: base[keySuffix]
      , newValue: base[keySuffix] = value
    });
  });

  if (callback) callback(value);

  return this;
};

Glue.prototype.bindTo = function(target, callback){
  var oldValue = this.target;

  this.notify("target", {
      operation: 'target'
    , oldValue: oldValue
    , newValue: this.target = target
  });

  if (callback) callback(oldValue, this.target);

  return this;
};

Glue.prototype.addListener = function() {
  var self = this
      a    = arguments;

  if (a.length === 1) {
    add('*', a[0], a[0]);
  } else if (a.length === 2) {
    if (_.isString(a[0])) {
      add(a[0], a[1], a[1]);
    } else {
      add('*', a[1], a[0]);
    }
  } else {
    add(a[0], a[2], a[1]);
  }

  function add(keys, listener, target) {
    _.each(keys.split(','), function(key) {
      if (key === '*') {
        self.listeners.any.push( { target: target, func: listener });
      } else {
        if (key.match(/\#/)) {
          key = Glue.normalizeKey(key);

          self.listeners.oldComputedValues[key] = self.get(key);
          pushListener('computed', key, listener, target);
        } else {
          key = Glue.normalizeKey(key);
          pushListener('assigned', key, listener, target);
        }
      }
    });
  };

  function pushListener(type, key, listener, target) {
    self.listeners[type][key] = self.listeners[type][key] || [];
    self.listeners[type][key].push({ target: target, func: listener })
  };

  return this;
};


// TODO Just look at this... its all fucked up. Refactoring needed
Glue.prototype.removeListener = function() {
  var self = this
    , a = arguments;

  if(a.length === 0) {
    remove('*');
  } else if (a.length === 1) {
    _.isString(a[0]) ? remove(a[0]) : remove(void 0, a[0]);
  } else if (a.length === 2) {
    remove(a[0], a[1]);
  }

  function remove(key, target) {
    if (key === '*' || key === void 0) {
      if (target) {
        self.listeners.any = _.reject(self.listeners.any, function(listener) {
          return listener.target === target;
        });

        _.each(self.listeners.computed, function(listeners, key) {
          self.listeners.computed[key] = _.reject(listeners, function(listener) {
            return listener.target === target
          });
        });

        _.each(self.listeners.assigned, function(listeners, key) {
          self.listeners.assigned[key] = _.reject(listeners, function(listener) {
            return listener.target === target
          });
        });

      } else {
        self.resetListeners();
      }
    } else {
      if (target) {
        if ((key.match(/\#/))) {
          key = key.replace(/\#/g, '.');

          self.listeners.computed[key] = _.reject(self.listeners.computed[key], function(listener) {
            return listener.target === target;
          });
        } else {
          self.listeners.assigned[key] = _.reject(self.listeners.assigned[key], function(listener) {
            return listener.target === target;
          });
        }
      } else {
        if ((key.match(/\#/))) key = key.replace(/\#/g, '.');
        delete self.listeners.computed[key];
        delete self.listeners.assigned[key];
      }
    }
  }

  return this;
};

Glue.prototype.notify = function(keys, msg) {
  var self = this;

  if (!_.isEqual(msg.oldValue, msg.newValue)) {
    _.each(keys.replace(/\s/g,'').split(','), function(key) {
      notifyOnKey(key.split('.'));
    });
  }

  function notifyOnKey (keySegments) {
    if (!_.isEmpty(keySegments)) {
      _.each(self.listeners.any, function(listener) {
        listener.func.call(listener.target, msg);
      });

      _.each(self.listeners.computed, function(listeners, key) {
        var newValue = self.get(key)
          , oldValue = self.listeners.oldComputedValues[key];

        if (newValue !== oldValue) {
          self.listeners.oldComputedValues[key] = newValue;

          _.each(listeners, function(listener) {
            listener.func.call(listener.target, msg);
          });
        }
      });

      _.each(self.listeners.assigned[keySegments.join('.')], function(listener) {
        listener.func.call(listener.target, msg);
      });

      keySegments.pop();
      notifyOnKey(keySegments);
    }
  }

  return this;
};

Glue.prototype.push = function() {
  var self = this
      a = arguments;

  if (a.length === 1) {
    push('target', this.target, a[0]);
  } else if (a.length === 2 && _.isFunction(a[1])) {
    push('target', this.target, a[0], a[1]);
  } else if (a.length === 3) {
    pushKeys(a[0], a[1], a[2]);
  } else {
    pushKeys(a[0], a[1]);
  }

  function pushKeys(keys, item, callback) {
    _.each(keys.split(','), function(key) {
      key = Glue.normalizeKey(key);
      push(key, self.get(key), item);
    });
  }

  function push(key, collection, item, callback) {
    collection.push(item);

    if (callback) callback(collection, item);

    self.notify(key, {
        operation: "push"
      , newValue: item
      , collection: collection
      , length: collection.length
    });
  };

  return this;
};

// Glue.prototype.removeAt = function(collectionKeyPath, index){
//   var collection = this.get(collectionKeyPath);
//   var result = collection.splice.call( collection, index, 1 );
//   this.notify.call(this, collectionKeyPath, {
//     "keyPath": collectionKeyPath,
//     "collectionOperation": "remove",
//     "value": result,
//     "collection": collection,
//     "currentCount":this.count(collectionKeyPath)
//   });
// 
//   return this;
// };
// 
// Glue.prototype.insertAt = function(collectionKeyPath, index, item){
//   var args = Array.prototype.splice.call(arguments);
// 
//   var collection = this.get(collectionKeyPath);
// 
//   collection.splice.call( collection, index, 0, item );
//   this.notify.call(this, collectionKeyPath, {
//     "keyPath": collectionKeyPath,
//     "collectionOperation": "add",
//     "value": item,
//     "collection": collection,
//     "currentCount":this.count(collectionKeyPath)
//   });
// 
//   return this;
// };

module.exports = Glue;
