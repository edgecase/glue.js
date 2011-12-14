var _ = require('underscore');

var Glue = function(target) {
  this.target = target;

  this.resetListeners = function() {
    this.listeners = {
      any: [],
      assigned: {},
      computed: {},
      oldValues: {}
    };
  }

  this.resetListeners();

  /*
  * User's should not use this. If user's want to get the value
  * access it directly (ie. topic.target.attr not glue.get('attr'))
  *
  */

  this.get = function() {
    key = _.map(Array.prototype.slice.call(arguments), function(key) {
      return key.replace(/\#/,'.');
    }).join('.').replace(/\s/g,'');

    if (_.isArray(this.target)) {
      key = key.length > 0 ? "this.target" + key : "this.target";
    } else {
      key = key.length > 0 ? "this.target." + key : "this.target";
    }

    return eval(key);
  };

  /*
  * User's should not use this publicly.
  *
  */

  this.notify = function(keys, msg) {
    var self = this;

    if (!_.isEqual(msg.oldValue, msg.newValue)) {
      _.each(keys.replace(/\s/g,'').split(','), function(key) {
        notifyOnKey(key.split('.'));
      });
    }

    function notifyOnKey (keySegments) {
      if (!_.isEmpty(keySegments)) {
        _.each(self.listeners.any, function(listener) {
          listener.func.call(listener.target, msg);
        });

        _.each(self.listeners.computed, function(listeners, key) {
          var newValue = self.get(key)
            , oldValue = self.listeners.oldValues[key];

          if (newValue !== oldValue) {
            self.listeners.oldValues[key] = newValue;

            msg.oldValue = oldValue;
            msg.newValue = newValue;

            _.each(listeners, function(listener) {
              listener.func.call(listener.target, msg);
            });
          }
        });

        _.each(self.listeners.assigned[keySegments.join('.')], function(listener) {
          listener.func.call(listener.target, msg);
        });

        keySegments.pop();
        notifyOnKey(keySegments);
      }
    }

    return this;
  };

};

Glue.version = '0.4.0'

Glue.normalizeKey = function(key) {
  return key.replace(/\#/g,'.').replace(/\]|\s/g,'');
};


/*
* Signature
*
* topic.bindTo(obj, [callback]);
*
*/

Glue.prototype.bindTo = function(target, callback){
  var oldValue = this.target;

  this.notify("target", {
      operation: 'target'
    , oldValue: oldValue
    , newValue: this.target = target
  });

  if (callback) callback(oldValue, this.target);

  return this;
};

/*
* Signature
*
* topic.addListener(handler);
* topic.addListener('*', handler);
* topic.addListener('v1' handler);
* topic.addListener(obj, handler);
* topic.addListener('v1', obj, handler);
* topic.addListener('v1.v2', obj, handler);
* topic.addListener('arr#length', obj, handler);
* topic.addListener('v1, v2', handler);
* topic.addListener('v1, v2', obj, handler);
*
*/

Glue.prototype.addListener = function() {
  var self = this
      a    = arguments;

  if (a.length === 1) {
    add('*', a[0], a[0]);
  } else if (a.length === 2) {
    if (_.isString(a[0])) {
      add(a[0], a[1], a[1]);
    } else {
      add('*', a[1], a[0]);
    }
  } else {
    add(a[0], a[2], a[1]);
  }

  function add(keys, listener, target) {
    _.each(keys.split(','), function(key) {
      if (key === '*') {
        self.listeners.any.push( { target: target, func: listener });
      } else {
        if (key.match(/\#/)) {
          key = Glue.normalizeKey(key);

          self.listeners.oldValues[key] = self.get(key);
          pushListener('computed', key, listener, target);
        } else {
          key = Glue.normalizeKey(key);
          pushListener('assigned', key, listener, target);
        }
      }
    });
  };

  function pushListener(type, key, listener, target) {
    self.listeners[type][key] = self.listeners[type][key] || [];
    self.listeners[type][key].push({ target: target, func: listener })
  };

  return this;
};

/*
* Signature
*
* topic.removeListener();
* topic.removeListener('*');
* topic.removeListener('v1');
* topic.removeListener('v1', obj);
* topic.removeListener('arr#length');
* topic.removeListener('arr#length', obj);
* topic.removeListener('v1, v2');
* topic.removeListener('v1, v2', obj);
*
*/

Glue.prototype.removeListener = function() {
  var self = this
    , a = arguments;

  if(a.length === 0) {
    removeKeys('*');
  } else if (a.length === 1) {
    _.isString(a[0]) ? removeKeys(a[0]) : removeKeys(void 0, a[0]);
  } else if (a.length === 2) {
    removeKeys(a[0], a[1]);
  }

  function removeKeys(keys, target) {
    if (keys) {
      _.each(keys.replace(/\s/g, '').split(','), function(key) {
        remove(key, target);
      });
    } else {
      remove(keys, target);
    }
  };

  function remove(key, target) {
    if (key === '*' || key === void 0) {
      if (target) {
        self.listeners.any = _.reject(self.listeners.any, function(listener) {
          return listener.target === target;
        });

        _.each(self.listeners.computed, function(listeners, key) {
          removeListenerType('computed', key, target)

          if (_.isEmpty(self.listeners.computed[key])) {
            delete self.listeners.oldValues[key];
          };
        });

        _.each(self.listeners.assigned, function(listeners, key) {
          removeListenerType('assigned', key, target)
        });
      } else {
        self.resetListeners();
      }
    } else {
      if (target) {
        if ((key.match(/\#/))) {
          key = key.replace(/\#/g, '.');
          removeListenerType('computed', key, target)
        } else {
          removeListenerType('assigned', key, target)
        }
      } else {
        if ((key.match(/\#/))) {
          delete self.listeners.computed[key.replace(/\#/g, '.')];
        } else {
          delete self.listeners.assigned[key];
        }
      }
    }
  }

  function removeListenerType(type, key, target) {
    self.listeners[type][key] = _.reject(self.listeners[type][key], function(listener) {
      return listener.target === target;
    });
  }

  return this;
};

/*
* Signature
*
* topic.set('v1', 'foo', [callback]);
* topic.set('v1.v2', 'foo', [callback]);
* topic.set('v1.v2.v3', 'foo', [callback]);
* topic.set('[0]', 'foo', [callback]);
* topic.set('arr[0]', 'foo', [callback]);
* topic.set('v1.arr[0]', 'foo', [callback]);
* topic.set('v1.arr[0].v2', 'foo', [callback]);
* topic.set('v1, v2', 'foo', [callback]);
*
*/

Glue.prototype.set = function(keys, value, callback) {
  var self = this;

  _.each(keys.split(','), function(key) {
    var lastDot     = key.lastIndexOf(".")
      , lastBracket = key.lastIndexOf("[")
      , index       = lastBracket > lastDot ? lastBracket : lastDot
      , keySuffix   = Glue.normalizeKey(key.substring(index+1));

    var base = self.get(key.substring(0, index));

    self.notify(key, {
        operation: 'set'
      , oldValue: base[keySuffix]
      , newValue: base[keySuffix] = value
    });
  });

  if (callback) callback(value);

  return this;
};

/*
* Signature
*
* topic.remove('v1');
* topic.remove('v1', [callback]);
* topic.remove('[i]', [callback]);
* topic.remove('arr[i]', [callback];
* topic.remove('v1.arr[i]',[callback]);
* topic.remove('v1.arr[i].v2',[callback]);
*
*/
Glue.prototype.remove = function(){
  var self = this
    , a = arguments;

  if (a.length === 1) {
    removeValue(a[0]);
  }

  function removeValue(key, callback) {
    var oldValue = self.get(key);

    if (key.match(/\[(\d+)\]$/)) {
      var index = key.match(/\[(\d+)\]$/)[1];
      self.target.splice(index, 1);
    } else {
      delete self.target[key];
    }

    self.notify(key, {
        operation: 'remove'
      , oldValue: oldValue
    });
  }

  return this;
};


/*
* Signature
*
* topic.push(1, [callback]);
* topic.push('arr', 1, [callback]);
* topic.push('v1.arr', 1, [callback]);
*
*/

Glue.prototype.push = function() {
  var self = this
      a = arguments;

  if (a.length === 1) {
    push('target', this.target, a[0]);
  } else if (a.length === 2 && _.isFunction(a[1])) {
    push('target', this.target, a[0], a[1]);
  } else if (a.length === 3) {
    pushKeys(a[0], a[1], a[2]);
  } else {
    pushKeys(a[0], a[1]);
  }

  function pushKeys(keys, item, callback) {
    _.each(keys.split(','), function(key) {
      key = Glue.normalizeKey(key);
      push(key, self.get(key), item);
    });
  }

  function push(key, collection, item, callback) {
    collection.push(item);

    self.notify(key, {
        operation: "push"
      , newValue: item
      , collection: collection
      , length: collection.length
    });

    if (callback) callback(collection, item);
  };

  return this;
};

/*
* Signature
*
* topic.pop([callback]);
* topic.pop('arr', [callback];
* topic.pop('v1.arr', [callback]);
*
*/
Glue.prototype.pop = function(){
  return this;
};

/*
* Signature
*
* topic.reject([callback]);
* topic.reject('col', [callback];
* topic.reject('v1.col', [callback]);
*
*/
Glue.prototype.reject = function() {
};

/*
* Signature
*
* topic.reject([callback]);
* topic.reject('col', [callback];
* topic.reject('v1.col', [callback]);
*
*/
Glue.prototype.filter = function() {
};

module.exports = Glue;
