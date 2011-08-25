(function(scope){
  String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); }

  function Glue(){
    this.anyKeyPath = "*"
    this.listeners= [];
  }

  // Recursively set properties based on keyPaths.
  //
  // example:
  // var obj = { "foo": { "bar": { "baz": "Leon" } } };
  // obj.setPropertyOnBoundObject("foo.bar.baz", "Jerry")
  // -> { "foo": { "bar": { "baz": "Jerry" } } };
  Glue.prototype.setPropertyOnBoundObject = function(keyPath, newValue, obj) {
    var keyPaths = keyPath.split(/\./);
    var firstKeyPath = keyPaths[0];
    if( keyPaths.length < 2 || keyPaths.length > 0 ){
      obj[firstKeyPath] = newValue;
    } else {
      keyPaths.shift()
      this.setPropertyOnBoundObject(keyPaths.join("."), newValue, obj[firstKeyPath] || {});
    }
  };

  Glue.prototype.bindTo = function(objectReference){
    var oldObject = this.boundObject
    this.boundObject = objectReference;
    this.broadcast.call(this, "boundObject", {
      "object"  : this,
      "keyPath" : "boundObject",
      "oldValue": oldObject,
      "newValue": this.boundObject
    });
  };

  Glue.prototype.isObservable = function(o){
    return (o.addObserver && o.removeObserver && o.broadcast);
  };

  Glue.prototype.isNothing = function(o){
    return o === void 0 || o === null;
  };

  // Adds a Listener to the controller.
  Glue.prototype.addObserver= function(){
    if(arguments.length <= 1){ throw "Not enough arguments to observe."; }

    var target = arguments[0];
    if( this.isNothing(target) ){ throw "Target must be an object instance." }

    var keyPath        = arguments[1] || this.anyKeyPath
    ,   hollaback      = arguments[2]
    ,   observedObject = this.boundObject
    ;

    if( _.isFunction(keyPath) ){
      hollaback = keyPath;
      keyPath   = this.anyKeyPath;
    }

    if( keyPath.match(/\,/gi) ){
      kps = keyPath.split(",")
      for(var i =0; i < kps.length; i++){
        this.listeners.push({
          "observedObject": observedObject,
          "target":         target,
          "keyPath":        kps[i].trim(),
          "hollaback":      hollaback,
        });
      }
    } else {
      this.listeners.push({
        "observedObject": observedObject,
        "target":         target,
        "keyPath":        keyPath.trim(),
        "hollaback":      hollaback,
      });
    }
    return this;
  };

  // Removes listener.
  // It is ok to remove a listener that has not .
  Glue.prototype.removeObserver= function(target, keyPath){
    if( this.isNothing(target) ) throw "Target must be an object instance."
    for(var i=this.listeners.length ; i >= 0; i--){
      if(this.listeners[i].target === target && this.listeners[i].keyPath === keyPath){
        this.listeners.splice(i,1)
      }
    }
    return this;
  };

  // keypath can be null, just as it can be assigned as null
  // This provides a way to observe arbitrary/global events from a Controller.
  Glue.prototype.broadcast= function(keyPath, payload){
    for(var i=0 ; i < this.listeners.length ; i++){
      var listener = this.listeners[i];
      if( _.isArray(listener.observedObject) || (listener.observedObject === this.boundObject) ) {
        if( listener.keyPath === this.anyKeyPath || keyPath === listener.keyPath ) {
          listener.hollaback.call(listener.target, payload);
        }
      }
    }
    return this;
  };

  scope.Glue = Glue;
})(this);
