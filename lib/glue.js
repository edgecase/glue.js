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
  return key.replace(/\#| /g,'').split(',');
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
        oldValue: base[keySuffix]
      , newValue: base[keySuffix] = value
    });
  });

  return this;
};

Glue.prototype.bindTo = function(target, callback){
  this.notify("target", {
    oldValue: this.target,
    value: this.target = target
  });

  if (callback) callback(oldValue, value);
  return this;
};

Glue.prototype.addListener = function(key, listener) {
  this.listeners.assigned[key] = this.listeners.assigned[key] || [];
  this.listeners.assigned[key].push({target: listener, func: listener});

  return this;
};

Glue.prototype.removeListener = function() {
//   if (arguments.length === 0) {
//     this.listeners = {
//       any: [],
//       assigned: {},
//       computed: {}
//     }
//   } else {
//     var keyPath = arguments[0]
//       , target = arguments[1];
// 
//     if (keyPath === Glue.ANY_KEYPATH) {
//       this.listeners.any = _.reject(this.listeners.any, function(listener) {
//         return listener.target = target;
//       });
//     } else {
//     }
//   }
// 
//   return this;
};

Glue.prototype.notify = function(keys, msg) {
  var self = this;

  _.each(Glue.normalizeKeys(keys), function(key) {
    // _.each(this.listeners.any, function(listener) {
    //   listener.callback.call(listener.target, msg);
    // });

    _.each(self.listeners.assigned[key], function(listener) {
      listener.func.call(listener.target, msg);
    });

    // _.each(this.listeners.computed, function(listenerGroup, keyPath) {
    //   var newValue = eval("self.target." + keyPath);

    //   _.each(listenerGroup, function(listener) {
    //     if(!_.isEqual(newValue, listener.oldValue)) {
    //       listener.callback.call(listener.target, {
    //         oldValue: listener.oldValue,
    //         value: newValue
    //       });

    //       listener.oldValue = newValue;
    //     }
    //   });
    // });
  });

  return this;
};
// 
// // Collection addons for use with enumerable keyPaths
// Glue.prototype.add = function(collectionKeyPath, item) {
//   var targetCollection = this.get(collectionKeyPath);
//   targetCollection.push(item);
// 
//   this.notify.call(this, collectionKeyPath, {
//     "keyPath": collectionKeyPath,
//     "collectionOperation": "add",
//     "value": item,
//     "collection":targetCollection,
//     "currentCount": this.count(collectionKeyPath)
//   });
// 
//   return this;
// };
// 
// 
// Glue.prototype.replaceWith = function(collectionKeyPath, obj, index){
//   var collection = this.get(collectionKeyPath);
//   var result = collection.splice.call( collection, index, 1, obj );
//   this.notify.call(this, collectionKeyPath, {
//     "keyPath": collectionKeyPath,
//     "collectionOperation": "replace",
//     "value": result,
//     "collection": collection,
//     "currentCount":this.count(collectionKeyPath)
//   });
// 
//   return this;
// };
// 
// 
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
// 
// Glue.prototype.objectAt = function(collectionKeyPath, indx) {
//   return this.get(collectionKeyPath)[indx];
// };
// 
// Glue.prototype.count = function(collectionKeyPath) {
//   return this.get(collectionKeyPath).length;
// };

module.exports = Glue;
