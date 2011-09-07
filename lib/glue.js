var util = require('util'),
    _ = require('../vendor/underscore-min');

var Glue = function(obj) {
  this.boundObject = obj;

  this.listeners = {};
  this.listenersCalcOrFunc = {};

  this.anyKeyPath = '*';

  this.keyPathIsCalculated = function(keyPath) {
    return keyPath.match(/\(.+\)$/);
  };

  this.keyPathIsFunctional = function(keyPath) {
    return keyPath.match(/.+\(\)$/);
  };

  this.keyPathIsFunctionalOrCalculated = function(keyPath) {
    return keyPath.match(/\(?.+?\(?\)/);
  };
};

Glue.prototype.get = function(keyPaths) {
  var self = this;

  var getProperty = function(keys, obj) {
    var value, key = _.first(keys);

    if(self.keyPathIsFunctional(key)) {
      key = key.replace(/\(\)/, "");

      if (keys.length === 1) {
        value = obj[key].apply(self.boundObject);
      } else {
        value = getProperty(_.rest(keys), obj[key].apply(self.boundObject));
      }
    } else {
      if(self.keyPathIsCalculated(key)) {
        key = key.replace(/\(/, "").replace(/\)/, "");
      }

      if (keys.length === 1) {
        value = obj[key];
      } else {
        value = getProperty(_.rest(keys), obj[key]);
      }
    }

    return value;
  };

  return getProperty(keyPaths.split('.'), this.boundObject);
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
  var oldObject = this.boundObject;
  this.boundObject = obj;

  this.notify("boundObject", {
    oldValue: oldObject,
    value: this.boundObject
  });

  return this;
};

Glue.prototype.addListener = function() {
  var hollaback, keyPath, listenerType,
      target = arguments[0];

  switch (arguments.length) {
    case 1:
      hollaback = arguments[0];

      break;
    case 2:
      if(_.isFunction(arguments[0])) {
        keyPath = arguments[1];
        hollaback = arguments[0];
      } else {
        hollaback = arguments[1];
      }

      break;
    default:
      keyPath = arguments[1];
      hollaback = arguments[2];

      break;
  }

  keyPath = keyPath || this.anyKeyPath;

  var listener = {
    target:     target,
    hollaback:  hollaback
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
  var keyPath, hollaback;
  var self = this;

  var removeHollaback = function(listeners, hollaback) {
    listeners = _.reject(listeners, function(listener) {
      return _.isEqual(listener.hollaback, hollaback);
    });

    return listeners;
  };

  switch(arguments.length) {

    case 0:
      this.listeners = {};
      this.listenersCalcOrFunc = {};

      break;
    case 1:
      if(_.isFunction(arguments[0])) {
        hollaback = arguments[0];

        _.each(['listeners', 'listenersCalcOrFunc'], function(listenerType) {
          _.each(self[listenerType], function(listenerGroup, keyPath) {
            self[listenerGroup][keyPath] = removeHollaback(listenerGroup, hollaback);

            if(_.isEmpty(self[listenerType][keyPath])) {
              delete self[listenerType][keyPath];
            }
          });
        });
      } else {
        keyPath = arguments[0];

        _.each(['listeners', 'listenersCalcOrFunc'], function(listenerType) {
          delete self[listenerType][keyPath];
        });
      }

      break;
    default:
      keyPath = arguments[0];
      hollaback = arguments[1];

      _.each(['listeners', 'listenersCalcOrFunc'], function(listenerType) {
        self[listenerType][keyPath] = removeHollaback(self[listenerType][keyPath], hollaback);

        if(_.isEmpty(self[listenerType][keyPath])) {
          delete self[listenerType][keyPath];
        }
      });

      break;
  }

  return this;
};

Glue.prototype.notify = function(keyPath, msg){
  var self = this;

  _.each(this.listeners[keyPath], function(listener) {
    listener.hollaback.call(listener.target, msg);
  });

  _.each(this.listeners[this.anyKeyPath], function(listener) {
    listener.hollaback.call(listener.target, msg);
  });

  _.each(this.listenersCalcOrFunc, function(listenerGroup, keyPath) {
    var newValue = self.get(keyPath);

    _.each(listenerGroup, function(listener) {
      if(!_.isEqual(newValue, listener.oldValue)) {
        listener.hollaback.call(listener.target, {
          oldValue: listener.oldValue,
          value: newValue
        });

        listener.oldValue = newValue;
      }
    });
  });

  return this;
};

if( typeof module !== "undefined" && ('exports' in module)){
  module.exports = Glue;
}
