var util = require('util')
,   _ = require('../vendor/underscore-min');

_.mixin({
  isObservable: function(obj){
    return (obj.addObserver && obj.removeObserver && obj.broadcast);
  }
});

var Glue = function(obj) {
  this.listeners = {};
  this.anyKeyPath = '*';
  this.boundObject = obj;
}

Glue.prototype.get = function(keyPaths) {
  var getProperty = function(keys, obj) {
    if (keys.length == 1) {
      return obj[_.first(keys)];
    } else {
      return getProperty(_.rest(keys), obj[_.first(keys)]);
    }
  }

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
  }

  _.extend(this.boundObject, setProperty(keyPath.split('.'), this.boundObject));

  this.broadcast.call(this, keyPath, {
    "oldValue": oldValue
  , "value": newValue
  });

  return this;
};

Glue.prototype.getBoundObject = function() {
  return _.extend({}, this.boundObject);
}

// Glue.prototype.bindTo = function(obj){
//   var oldObject = this.boundObject
//   this.boundObject = obj;
//
//   this.broadcast.call(this, "boundObject", {
//     "object"  : this,
//     "keyPath" : "boundObject",
//     "oldValue": oldObject,
//     "value": this.boundObject
//   });
// };

Glue.prototype.addObserver = function() {
  var target = arguments[0];

  switch (arguments.length) {
    case 1:
      var hollaback = arguments[0]

      break;
    case 2:
      if(_.isFunction(arguments[0])) {
        var hollaback = arguments[0]
        ,   keyPath = arguments[1];
      } else {
        var hollaback = arguments[1];
      }

      break;
    case 3:
      var keyPath = arguments[1]
      ,   hollaback = arguments[2];

      break;
  }

  keyPath = keyPath || this.anyKeyPath;

  this.listeners[keyPath] = this.listeners[keyPath] || [];
  this.listeners[keyPath].push({
    "target":         target
  , "hollaback":      hollaback
  });

  return this;
};

// Glue.prototype.removeObserver = function(target, keyPath){
//   for(var i=this.listeners.length ; i >= 0; i--){
//     if(this.listeners[i].target === target && this.listeners[i].keyPath === keyPath){
//       this.listeners.splice(i,1)
//     }
//   }
//   return this;
// };

Glue.prototype.broadcast = function(keyPath, msg){
  var self = this;

  _.each(this.listeners[keyPath], function(listener) {
    listener.hollaback.call(listener.target, msg);
  })

  _.each(this.listeners[this.anyKeyPath], function(listener) {
    listener.hollaback.call(listener.target, msg);
  })
};

if( typeof module !== "undefined" && ('exports' in module)){
  module.exports = Glue;
}
