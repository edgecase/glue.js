// ObjectController
// Leon Gersing
//
// The ObjectController observes a javascript object and
// broadcasts listeners to changes that take place on them.
//
// var oc = new ObjectController(target, [keyPath], hollaback);
//
// target:  The object that is listening to target object for changes.
// keyPath: Any known property that can be set via a
//          standard property setter can be observed.
// hollaback: The function that should be invoked when a message is
//            sent to the observing objects.
//
// chainable: true
//
// NOTE: it does not delegate model events to it's listners.
//       In order to Observe events on individual objects, you
//       must establish those observers independently of the
//       collection in which they are added.

Glue = (window) ? window.Glue : require("../glue");
var ObjectController = function() {
  Glue.call(this);
  this.bindTo(arguments[0] || {});
}
ObjectController.prototype = Glue.prototype;

ObjectController.prototype.get = function(keyPath, obj) {
  if( !obj ) obj = this.boundObject;
  var keyPaths = keyPath.split(/\./);
  var firstKeyPath = keyPaths[0];
  var currentValue = obj[firstKeyPath];
  if( !currentValue) return;
  if( keyPaths.length < 2 ){
    return currentValue;
  } else {
    keyPaths.shift();
    return this.get(keyPaths.join("."), currentValue);
  }
};

ObjectController.prototype.set = function(keyPath, newValue){
  var oldValue = this.get(keyPath);
  var expectedNewValue = newValue;
  this.setPropertyOnBoundObject(keyPath, newValue, this.boundObject);
  this.broadcast.call(this, keyPath, {
    "object"  : this,
    "keyPath" : keyPath,
    "oldValue": oldValue,
    "newValue": expectedNewValue
  });
  return this;
};
