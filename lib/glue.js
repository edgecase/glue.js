var _ = require('underscore');

var Glue = function(obj) {
  this.boundObject = obj;

  this.listeners = {};
  this.listenersCalcOrFunc = {};

  this.anyKeyPath = '*';

  this.keyPathIsFunctional = function(keyPath) {
    return !!keyPath.match(/.+\(\)$/);
  };

  this.keyPathIsFunctionalOrCalculated = function(keyPath) {
    return !!keyPath.match(/\(?.+?\(?\)/);
  };
};

Glue.version = '0.3.0'

Glue.prototype.get = function(keyPaths) {
  var self = this;

  keyPaths = _.map(keyPaths.split('.'), function(key) {
    if (key.match(/\(.+\)$/)) key = key.replace(/\(/, "").replace(/\)/, "");
    return key;
  }).join('.');

  return eval("this.boundObject." + keyPaths);
};

Glue.prototype.set = function(keyPath, newValue){
  var oldValue = this.get(keyPath);

  var setProperty = function(keys, obj) {
    if ( keys.length === 1 ) {
      obj[_.first(keys)] = newValue;
    } else {
      obj[_.first(keys)] = setProperty(_.rest(keys), obj[_.first(keys)]);
    }

    return obj;
  };

  _.extend(this.boundObject, setProperty(keyPath.split('.'), this.boundObject));

  this.notify(keyPath, {
    oldValue: oldValue,
    value: newValue
  });

  return this;
};

Glue.prototype.getBoundObject = function() {
  return _.clone(this.boundObject);
};

Glue.prototype.bindTo = function(obj){
  this.notify("boundObject", {
    oldValue: this.boundObject,
    value: this.boundObject = obj
  });

  return this;
};

Glue.prototype.addListener = function() {
  var callback, keyPath, listenerType,
      target = arguments[0];

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

  keyPath = keyPath || this.anyKeyPath;

  var listener = {
    target:     target,
    callback:  callback
  };

  if(this.keyPathIsFunctionalOrCalculated(keyPath)) {
    listenerType = "listenersCalcOrFunc";
    listener.oldValue = this.get(keyPath);
  } else {
    listenerType = "listeners";
  }

  this[listenerType][keyPath] = this[listenerType][keyPath] || [];
  this[listenerType][keyPath].push(listener);

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

  _.each(this.listeners[keyPath], function(listener) {
    listener.callback.call(listener.target, msg);
  });

  _.each(this.listeners[this.anyKeyPath], function(listener) {
    listener.callback.call(listener.target, msg);
  });

  _.each(this.listenersCalcOrFunc, function(listenerGroup, keyPath) {
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
