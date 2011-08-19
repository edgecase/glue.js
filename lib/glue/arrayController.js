// ArrayController
// Leon Gersing
//
// The ArrayController observes an array of arbitrary items
// for the following agumentations to its internal dataset.
//
// keyPath: "add", "remove", "replace"
//
// NOTE: it does not delegate model events to it's listners.
//       In order to Observe events on individual objects, you
//       must establish those observers independently of the
//       collection in which they are added.

Glue = (exports) ? require("../glue") : window.Glue;
var ArrayController = function() {
  Glue.call(this);
  this.bindTo(arguments[0] || []);
}
ArrayController.prototype = Glue.prototype;

ArrayController.prototype.add = function(item) {
  if (!this.isObservable(item)){
    item = new ObjectController(item);
  };

  this.boundObject.push(item);
  this.broadcast.call(this, "add", {
    "keyPath":"add",
    "object": item,
    "currentCount":this.count()
  });
  return this;
};

ArrayController.prototype.remove = function(item) {
  for(var i=this.count(); i >= 0; i--){
    if(this.boundObject[i] === item){
      this.removeAtIndex(i);
    }
  }
  return this;
};

ArrayController.prototype.objectAtIndex = function(indx) {
  return this.boundObject[indx];
};

ArrayController.prototype.count = function() {
  return this.boundObject.length;
};

ArrayController.prototype.removeAtIndex = function(indx) {
  var item = this.boundObject.splice(indx,1);

  this.broadcast.call(this.boundObject, "remove", {
    "keyPath":"remove",
    "object":item,
    "currentCount":this.count()
  });
  return this;
};

ArrayController.prototype.replaceAtIndex = function(item, indx) {
  this.boundObject.splice(indx, 1, item);
  this.broadcast.call(this.boundObject, "replace", {
    "keyPath":"replace",
    "object":item,
    "currentCount":this.count()
  });

  return this;
};

if(exports) export.ArrayController = ArrayController;
