var util = require('util')
,   _ = require('../vendor/underscore-min');

_.mixin({
  isObservable: function(obj){
    return (obj.addObserver && obj.removeObserver && obj.broadcast);
  }
});

var Glue = function(obj) {
  // this.anyKeyPath = '*';
  // this.listeners= [];
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
      return obj;
    } else {
      obj[_.first(keys)] = setProperty(_.rest(keys), obj[_.first(keys)]);
      return obj;
    }
  }

  _.extend(this.boundObject, setProperty(keyPath.split('.'), this.boundObject));

  // this.broadcast.call(this, keyPath, {
  //   "object"  : this,
  //   "keyPath" : keyPath,
  //   "oldValue": oldValue,
  //   "newValue": newValue
  // });

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
//     "newValue": this.boundObject
//   });
// };

// Glue.prototype.addObserver = function(target){
//   var target = arguments[0];
// 
//   var keyPath        = arguments[1] || this.anyKeyPath
//   ,   hollaback      = arguments[2]
//   ,   observedObject = this.boundObject
//   ;
// 
//   if( _.isFunction(keyPath) ){
//     hollaback = keyPath;
//     keyPath   = this.anyKeyPath;
//   }
// 
//   if( keyPath.match(/\\\\\\\\,/gi) ){
//     kps = keyPath.split(",")
//     for(var i =0; i < kps.length; i++){
//       this.listeners.push({
//         "observedObject": observedObject,
//         "target":         target,
//         "keyPath":        kps[i].trim(),
//         "hollaback":      hollaback,
//       });
//     }
//   } else {
//     this.listeners.push({
//       "observedObject": observedObject,
//       "target":         target,
//       "keyPath":        keyPath.trim(),
//       "hollaback":      hollaback,
//     });
//   }
//   return this;
// };

// Glue.prototype.removeObserver = function(target, keyPath){
//   for(var i=this.listeners.length ; i >= 0; i--){
//     if(this.listeners[i].target === target && this.listeners[i].keyPath === keyPath){
//       this.listeners.splice(i,1)
//     }
//   }
//   return this;
// };

// Glue.prototype.broadcast = function(context, keyPath, payload){
//   var self = this;
// 
//   _.each(this.listeners, function(listener) {
//     if( _.isArray(listener.observedObject) || (listener.observedObject === self.boundObject) ) {
//       if( listener.keyPath === self.anyKeyPath || keyPath === listener.keyPath ) {
//         listener.hollaback.call(listener.target, payload);
//       }
//     }
//   });
// };

if( typeof module !== "undefined" && ('exports' in module)){
  module.exports = Glue;
}
