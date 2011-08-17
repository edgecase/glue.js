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

var ObjectController = function(concreteObjectReference) {
  this.boundObject = concreteObjectReference;
  Glue.call(this)
}
ObjectController.prototype = Glue.prototype;

ObjectController.prototype.resolveKeyPath = function(keyPath, baseObject, setterArgs){

  var components = keyPath.split(".");
  var newBaseObject;

  var currentKeyPath = components.shift();
  var possibleValue = baseObject[currentKeyPath];
  if( this.isNothing(possibleValue) ){ return ; }

  if( this.isFunc(possibleValue) ){
    newBaseObject = possibleValue.call(baseObject);
  } else {
    newBaseObject = possibleValue;
  }

  if( components.length > 0 ){
    return this.resolveKeyPath(components.join("."), newBaseObject, setterArgs);
  } else {
    if( !this.isNothing(setterArgs) ){
      console.log(setterArgs);
      newBaseObject[currentKeyPath] = setterArgs;
    }
    return newBaseObject;
  }
};

ObjectController.prototype.set = function(keyPath, newValue){
  var old = this.get(keyPath);
  var newVal = this.resolveKeyPath(keyPath, this.boundObject, newValue);
  this.broadcast.call(this, keyPath, {
    "keyPath" : keyPath,
    "object"  : this,
    "oldValue": old,
    "newValue": newVal
  });
  return this;
};

ObjectController.prototype.get = function(key){
  return this.resolveKeyPath(key, this.boundObject);
};
