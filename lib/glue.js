var _ = require('underscore');

var Glue = function(target) {
  this.target = target;

  this.listeners = {
    any: [],
    assigned: {},
    computed: {}
  }
};

Glue.ANY_KEYPATH = '*';
Glue.version = '0.4.0'

Glue.normalizeKeys = function(key) {
  return key.replace(/\s/g,'').split(',');
};

Glue.prototype.set = function(keys, value, callback) {
  var self = this;

  _.each(Glue.normalizeKeys(keys), function(key) {
    var lastDot     = key.lastIndexOf(".")
      , lastBracket = key.lastIndexOf("[")
      , index       = lastBracket > lastDot ? lastBracket : lastDot
      , fullKey     = "self.target"
      , keyPrefix   = key.substring(0, index)
      , keySuffix   = key.substring(++index).replace(']', '');

    if (keyPrefix) fullKey += "." + keyPrefix;

    var base = eval(fullKey);

    if (callback) callback(base[keySuffix], value);

    self.notify(key, {
        operation: 'set'
      , oldValue: base[keySuffix]
      , newValue: base[keySuffix] = value
    });
  });

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
  var self = this;

  if (arguments.length === 1) {
    add(Glue.ANY_KEYPATH, arguments[0], arguments[0]);
  } else if (arguments.length === 2) {
    if (_.isString(arguments[0])) {
      add(arguments[0], arguments[1], arguments[1]);
    } else {
      add(Glue.ANY_KEYPATH, arguments[1], arguments[0]);
    }
  } else {
    add(arguments[0], arguments[2], arguments[1]);
  }

  function add(key, listener, target) {
    if (key === Glue.ANY_KEYPATH) {
      self.listeners.any.push( { target: target, func: listener });
    } else {
      if (key.match(/\#/)) {
        key = Glue.normalizeKeys(key)[0].replace(/\#/g, '.');

        self.listeners.computed[key] = self.listeners.computed[key] || [[]];
        self.listeners.computed[key][0].push({ target: target, func: listener })
        self.listeners.computed[key][1] = eval("self.target." + key);
      } else {
        self.listeners.assigned[key] = self.listeners.assigned[key] || [];
        self.listeners.assigned[key].push({ target: target, func: listener });
      }
    }
  };

  return this;
};

Glue.prototype.removeListener = function() {
  var self = this;

  if (arguments.length === 0) {
    this.listeners = {
      any: [],
      assigned: {},
      computed: {}
    }
  } else if (arguments.length === 1) {
    var arg = arguments[0];

    if (arg === Glue.ANY_KEYPATH) {
      this.listeners.any = [];
    } else if (_.isString(arg)) {
      if (arg.match(/\#/)) {
        arg = arg.replace(/\#/g, '.');


        this.listeners.computed = _.reject(this.listeners.computed, function(listeners, key) {
          return key === arg;
        });
      } else {
        this.listeners.assigned = _.reject(this.listeners.assigned, function(listeners, key) {
          return key === arg;
        });
      }
    } else {
      this.listeners.any = _.reject(this.listeners.any, function(listener) {
        return listener.target === arg;
      });

      _.each(self.listeners.computed, function(listeners, key) {
        self.listeners.computed[key][0] = _.reject(listeners[0], function(listener) {
          return listener.target === arg;
        });
      });

      _.each(self.listeners.assigned, function(listeners, key) {
        self.listeners.assigned[key] = _.reject(listeners, function(listener) {
          return listener.target === arg;
        });
      });
    }
  }

  return this;
};

Glue.prototype.notify = function(key, msg) {
  var self = this;

  if (!_.isEqual(msg.oldValue, msg.newValue)) notifyOnKey(key.replace(/\s/g, '.').split('.'));

  function notifyOnKey (keySegments) {
    if (!_.isEmpty(keySegments)) {
      _.each(self.listeners.any, function(listener) {
        listener.func.call(listener.target, msg);
      });

      _.each(self.listeners.computed, function(listeners, key) {
        var newValue = eval("self.target." + key);

        if (newValue !== self.listeners.computed[key][1]) {
          self.listeners.computed[key][1] = newValue;

          _.each(listeners[0], function(listener) {
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
    , keys
    , item
    , callback;

  if (arguments.length === 1) {
    push('target', this.target, arguments[0]);
  } else if (arguments.length === 2 && _.isFunction(arguments[1])) {
    push('target', this.target, arguments[0], arguments[1]);
  } else if (arguments.length === 3) {
    pushKeys(arguments[0], arguments[1], arguments[2]);
  } else {
    pushKeys(arguments[0], item = arguments[1]);
  }

  function pushKeys(keys, item, callback) {
    _.each(Glue.normalizeKeys(keys), function(key) {
      push(key, eval("self.target." + key), item);
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
