// object type challenges lovingly inspired by _.js

function Glue(){
  var self = this
  ,   anyKeyPath = "*"
  ;
  self.listeners= [];

  self.isObservable = function(o){
    return (o.addObserver && o.removeObserver && o.broadcast);
  }

  var isFunc = function(o){
    return !!( o && o.constructor && o.call && o.apply );
  };

  var isNothing = function(o){
    return ( o === void 0 || o === null );
  };

  var isObject = function(o){
    return ( o === Object(o) );
  };

  var isArray = Array.isArray || function(o){
    return (toString.call(o) === '[object Array]');
  };

  // Adds a Listener to the controller.
  self.addObserver= function(){
    if(arguments.length <= 1) throw "Not enough arguments to observe.";

    var target = arguments[0];
    if( isNothing(target) ) throw "Target must be an object instance."

    var keyPath        = arguments[1] || "*"
    ,   hollaback      = arguments[2]
    ,   observedObject = this.boundObject
    ;

    if( isFunc(keyPath) ){
      hollaback = keyPath;
      keyPath   = anyKeyPath;
    }

    self.listeners.push({
      "observedObject": observedObject,
      "target":         target,
      "keyPath":        keyPath,
      "hollaback":      hollaback,
    });
    return self;
  };

  // Removes listener.
  // It is ok to remove a listener that has not .
  self.removeObserver= function(target, keyPath){
    if(target === undefined || target === null) throw "Target must be an object instance."
    for(var i=self.listeners.length ; i >= 0; i--){
      if(self.listeners[i].target === target && self.listeners[i].keyPath === keyPath){
        self.listeners.splice(i,1)
      }
    }
    return self;
  };

  // keypath can be null, just as it can be assigned as null
  // This provides a way to observe arbitrary/global events from a Controller.
  self.broadcast= function(keyPath, payload){
    for(var i=0 ; i < self.listeners.length ; i++){
      var listener = self.listeners[i];
      if( isArray(listener.observedObject) || (listener.observedObject === this) ) {
        if( listener.keyPath === anyKeyPath || keyPath === listener.keyPath ) {
          listener.hollaback.call(listener.target, payload);
        }
      }
    }
    return self;
  };

  //allow method chaining madness.
  return self;
};


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

function ObjectController(){
  var self = this;
  self.bindTo = function(objectReference){
    self.boundObject = objectReference;
  };

  self.set = function(){
    if(arguments.length == 1){
      var obj = arguments[0];
      if(obj !== Object(obj)) return;
      for(var key in obj){
        internalSet(key, obj[key]);
      }
    } else if (arguments.length == 2){
      internalSet(arguments[0], arguments[1]);
    }
    return self;
  };

  self.get = function(key){
    return self.boundObject[key];
  };

  // private methods
  var internalSet = function(k,v){
    var old = self.boundObject[k];
    self.boundObject[k] = v;
    self.broadcast.call(self.boundObject, k, {
      "keyPath" : k,
      "object"  : self,
      "oldValue": old,
      "newValue": v
    });
  };

  // bound property initializer
  // This is a shortcut for new ObjectController().bindTo({});
  self.bindTo(arguments[0]);
  return self;
};


// CollectionController
// Leon Gersing
//
// The CollectionController observes an array of arbitrary items
// for the following agumentations to its internal dataset.
//
// keyPath: "add", "remove", "replace"
//
// NOTE: it does not delegate model events to it's listners.
//       In order to Observe events on individual objects, you
//       must establish those observers independently of the
//       collection in which they are added.

function CollectionController(){
  var self = this;
  self.bindTo = function(collectionReference){
    self.boundObject = collectionReference || [];
  };

  self.add = function(item){
    if ( item === Object(item) && !self.isObservable(item) ){
      item = new ObjectController(item);
    };
    self.boundObject.push(item);
    self.broadcast.call(self.boundObject, "add", {
      "change":"add",
      "object":item,
      "currentCount":self.boundObject.length
    });
    return self;
  };

  self.remove = function(item){
    for(var i=self.boundObject.length ; i >= 0; i--){
      if(self.boundObject[i] === item){
        self.removeAtIndex(i);
      }
    }
    return self;
  };

  self.itemAtIndex= function(indx){
    return self.boundObject[indx];
  };

  self.count= function(){
    return self.boundObject.length;
  };

  self.removeAtIndex = function(indx){
    var item = self.boundObject.splice(indx,1);
    self.broadcast.call(self.boundObject, "remove", {
      "change":"remove",
      "object":item,
      "currentCount":self.boundObject.length
    });
    return self;
  };

  self.replaceAtIndex = function(item, indx){
    self.boundObject.splice(indx, 1, item);
    self.broadcast.call(self.boundObject, "replace", {
      "change":"replace",
      "object":item,
      "currentCount":self.boundObject.length
    });
    return self;
  };

  // bound property initializer
  // This is a shortcut for new CollectionController().bindTo([]);
  // It allows for this: 
  //   new CollectionController(myExistingArray);
  // or 
  //   new CollectionController().bindTo(myExistingArray);
  //
  // Both are acceptable and which you use will depend largely on your needs.
  // NOTE: It's completely legal to establish on bindingObject and later
  //       change it to something completely differnt.
  //       Doing so, does not notify the observers of the change and
  //       therefore may have odd side-effects.
  self.bindTo(arguments[0]);
  return self;
};

CollectionController.prototype = new Glue();
ObjectController.prototype = new Glue();

