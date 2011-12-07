var _ = require('underscore');

var Glue = function(target) {
  this.target = target;

  this.listeners = {
    any: [],
    assigned: {},
    calculated: {}
  }
};

Glue.ANY_KEYPATH = '*';
Glue.version = '0.4.0'

Glue.prototype.set = function(keyPath, newValue) {
  var path        = "this.target"
    , lastDot     = keyPath.lastIndexOf(".")
    , lastBracket = keyPath.lastIndexOf("[");

  var index = lastBracket > lastDot ? lastBracket : lastDot;

  var basePath = keyPath.substring(0, index)
    , topPath  = keyPath.substring(++index).replace(']', '');

  if (basePath) path += "." + basePath;

  var value = eval(path);

  this.notify(keyPath, {
    oldValue: value[topPath],
    value: value[topPath] = newValue
  });

  return this;
};

Glue.prototype.bindTo = function(target){
  this.notify("target", {
    oldValue: this.target,
    value: this.target = target
  });

  return this;
};

Glue.prototype.addListener = function() {
  var callback, keyPath, listenerType, target = arguments[0];

  switch (arguments.length) {
    case 1:
      callback = arguments[0];

      break;
    case 2:
      if(_.isFunction(arguments[0])) {
        keyPath = arguments[1];
        callback = arguments[0];
      } else {
        callback = arguments[1];
      }

      break;
    default:
      keyPath = arguments[1];
      callback = arguments[2];

      break;
  }

  keyPath = keyPath || Glue.ANY_KEYPATH;

  var listener = {
      target:   target
    , callback: callback
  };

  if (keyPath === Glue.ANY_KEYPATH) {
    listenerType = "any";
    this.listeners.any.push(listener);
  } else if (keyPath.match(/\(|\)/)) {
    listener.oldValue = eval("this.target." + keyPath);

    this.listeners.calculated[keyPath] = this.listeners.assigned[keyPath] || [];
    this.listeners.calculated[keyPath].push(listener);
  } else {
    this.listeners.assigned[keyPath] = this.listeners.assigned[keyPath] || [];
    this.listeners.assigned[keyPath].push(listener);
  }


  return this;
};

Glue.prototype.removeListener = function() {
  var keyPath, callback, target,
      self = this;

  var _remove = function(listeners, target, keyPath) {
    _.each(listeners, function(listenerGroup, key) {
      listeners[key] = _.reject(listenerGroup, function(listener) {
        return listener.target === target && !_.isUndefined(keyPath) && keyPath === key;
      });
    });

    return listeners;
  };

  if(arguments.length === 0) {
    this.listeners = {};
    this.listenersCalcOrFunc = {};
  } else if (arguments.length === 1 && !_.isUndefined((arguments[0]).keyPath)) {
    delete this.listeners[keyPath];
    delete this.listenersCalcOrFunc[keyPath];
  } else {
    target = arguments[0];
    keyPath = arguments[1];

    _.each(['listeners', 'listenersCalcOrFunc'], function(listenerType) {
      self.listeners = _remove(self[listenerType], target, keyPath);
    });
  }

  return this;
};

Glue.prototype.notify = function(keyPath, msg){
  var self = this;

  _.each(this.listeners.any, function(listener) {
    listener.callback.call(listener.target, msg);
  });

  _.each(this.listeners.assigned[keyPath], function(listener) {
    listener.callback.call(listener.target, msg);
  });

  _.each(this.listeners.calculated, function(listenerGroup, keyPath) {
    var newValue = self.get(keyPath);

    _.each(listenerGroup, function(listener) {
      if(!_.isEqual(newValue, listener.oldValue)) {
        listener.callback.call(listener.target, {
          oldValue: listener.oldValue,
          value: newValue
        });

        listener.oldValue = newValue;
      }
    });
  });

  return this;
};

// Collection addons for use with enumerable keyPaths
Glue.prototype.add = function(collectionKeyPath, item) {
  var targetCollection = this.get(collectionKeyPath);
  targetCollection.push(item);

  this.notify.call(this, collectionKeyPath, {
    "keyPath": collectionKeyPath,
    "collectionOperation": "add",
    "value": item,
    "collection":targetCollection,
    "currentCount": this.count(collectionKeyPath)
  });

  return this;
};


Glue.prototype.replaceWith = function(collectionKeyPath, obj, index){
  var collection = this.get(collectionKeyPath);
  var result = collection.splice.call( collection, index, 1, obj );
  this.notify.call(this, collectionKeyPath, {
    "keyPath": collectionKeyPath,
    "collectionOperation": "replace",
    "value": result,
    "collection": collection,
    "currentCount":this.count(collectionKeyPath)
  });

  return this;
};


Glue.prototype.removeAt = function(collectionKeyPath, index){
  var collection = this.get(collectionKeyPath);
  var result = collection.splice.call( collection, index, 1 );
  this.notify.call(this, collectionKeyPath, {
    "keyPath": collectionKeyPath,
    "collectionOperation": "remove",
    "value": result,
    "collection": collection,
    "currentCount":this.count(collectionKeyPath)
  });

  return this;
};

Glue.prototype.insertAt = function(collectionKeyPath, index, item){
  var args = Array.prototype.splice.call(arguments);

  var collection = this.get(collectionKeyPath);

  collection.splice.call( collection, index, 0, item );
  this.notify.call(this, collectionKeyPath, {
    "keyPath": collectionKeyPath,
    "collectionOperation": "add",
    "value": item,
    "collection": collection,
    "currentCount":this.count(collectionKeyPath)
  });

  return this;
};

Glue.prototype.objectAt = function(collectionKeyPath, indx) {
  return this.get(collectionKeyPath)[indx];
};

Glue.prototype.count = function(collectionKeyPath) {
  return this.get(collectionKeyPath).length;
};

module.exports = Glue;
