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

  this.get = function(key) {
    key = key.replace('#','.').replace(/\s/g,'');

    if (key.length > 0) {
      key = (_.isArray(this.target) ? "this.target" : "this.target.") + key;
    } else {
      key = "this.target";
    }

    return eval(key);
  };

  /*
  * User's should not use this publicly.
  *
  */
  this.notify = function(key, msg) {
    var self = this;

    if (!_.isEqual(msg.oldValue, msg.newValue)) {
      invoke(self.listeners.any);

      _.each(self.listeners.computed, function(listeners, key) {
        var newValue = self.get(key)
          , oldValue = self.listeners.oldValues[key];

        if (newValue !== oldValue) {
          self.listeners.oldValues[key] = newValue;

          msg.oldValue = oldValue;
          msg.newValue = newValue;

          invoke(listeners);
        }
      });

      notifyParents(key.split('.'));
    }

    function notifyParents(keySegments) {
      if (!_.isEmpty(keySegments)) {
        invoke(self.listeners.assigned[keySegments.join('.')]);
        notifyParents(_.initial(keySegments));
      }
    }

    function invoke(listeners) {
      _.each(listeners, function(listener) {
        listener.func.call(listener.target, msg);
      });
    }

    return this;
  };

};

Glue.version = '0.4.2'

/*
* Signature
*
* topic.bindTo(obj);
*
*/

Glue.prototype.bindTo = function(target){
  var oldValue = this.target;

  this.notify("target", {
      operation: 'target'
    , oldValue: oldValue
    , newValue: this.target = target
  });

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
    add('*', a[0], self.target);
  } else if (a.length === 2) {
    _.isString(a[0]) ?  add(a[0], a[1], self.target) : add('*', a[1], a[0]);
  } else {
    add(a[0], a[2], a[1]);
  }

  function add(keys, listener, target) {
    _.each(keys.split(','), function(key) {
      if (key === '*') {
        self.listeners.any.push({ target: target, func: listener });
      } else {
        var type = 'assigned';
        key = key.replace(/\s/g, '');

        if (key.match(/\#/)) {
          type = 'computed';
          key = key.replace('#','.');
          self.listeners.oldValues[key] = self.get(key);
        }

        self.listeners[type][key] = self.listeners[type][key] || [];
        self.listeners[type][key].push({ target: target, func: listener });
      }
    });
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
* topic.set('v1', 'foo');
* topic.set('v1.v2', 'foo';
* topic.set('v1.v2.v3', 'foo');
* topic.set('[0]', 'foo');
* topic.set('arr[0]', 'foo');
* topic.set('v1.arr[0]', 'foo');
* topic.set('v1.arr[0].v2', 'foo');
* topic.set('v1, v2', 'foo');
*
*/

Glue.prototype.set = function(keys, value) {
  var self = this;

  _.each(keys.replace(/\s/g, '').split(','), function(key) {
    var lastDot     = key.lastIndexOf(".")
      , lastBracket = key.lastIndexOf("[")
      , index       = lastBracket > lastDot ? lastBracket : lastDot
      , keySuffix   = key.substring(index+1).replace('#','.').replace(/\]/g, '');

    var base = self.get(key.substring(0, index));

    self.notify(key, {
        operation: 'set'
      , oldValue: base[keySuffix]
      , newValue: base[keySuffix] = value
    });
  });

  return this;
};

/*
* Signature
*
* topic.remove('v1');
* topic.remove('[i]');
* topic.remove('arr[i]');
* topic.remove('v1.arr[i]');
* topic.remove('v1.arr[i].v2');
* topic.remove('arr[i].arr');
* topic.remove('v1, v2');
*
*/
Glue.prototype.remove = function(keys){
  var self = this;

  _.each(keys.replace(/\s/g, '').split(','), function(key) {
      var a        = arguments
    , oldValue = self.get(key)
    , match    = key.match(/\[(\d+)\]$/)

    if (match) {
      var index           = match[1]
        , suffixLastIndex = key.lastIndexOf(match[0]);

      if (suffixLastIndex === 0) {
        self.target.splice(index, 1);
      } else {
        self.get(key.substr(0, suffixLastIndex)).splice(index, 1);
      }
    } else {
      key = key.split('.');

      if (key.length > 1) {
        var top = key.pop();
        delete self.get(key.join('.'))[top];
      } else {
        delete self.target[key[0]];
      }

      key = key.join('.');
    }

    self.notify(key, {
        operation: 'remove'
      , oldValue: oldValue
    });
  });

  return this;
};


/*
* Signature
*
* topic.push(1);
* topic.push('arr', 1);
* topic.push('v1.arr', 1);
* topic.push('arr1[i].arr2', 1);
* topic.push('arr1, arr2', 1);
*
*/

Glue.prototype.push = function() {
  var self = this
      a = arguments;

  if (a.length === 1) {
    push('target', this.target, a[0]);
  } else {
    pushKeys(a[0], a[1]);
  }

  function pushKeys(keys, item) {
    _.each(keys.split(','), function(key) {
      key = key.replace(/\s/g,'');
      push(key, self.get(key), item);
    });
  }

  function push(key, collection, item) {
    collection.push(item);

    self.notify(key, {
        operation: "push"
      , newValue: item
    });
  };

  return this;
};

/*
* Signature
*
* topic.pop();
* topic.pop('arr');
* topic.pop('v1.arr');
* topic.pop('arr1[i].arr');
*
*/
Glue.prototype.pop = function(){
  var self = this, value, key, a = arguments;

  keys = a.length === 0 ? '' : a[0];

  _.each(keys.replace(/\s/g, '').split(','), function(key) {
    value = self.get(key).pop();

    self.notify(key, {
        operation: "pop"
      , oldValue: value
    });
  });
  return value;
};

/*
* Signature
*
* topic.filter(handler);
* topic.filter('col', handler);
* topic.filter('v1.col', handler);
* topic.filter('arr[i].col', handler);
*
*/
Glue.prototype.filter = function() {
  var self = this
    , collection
    , removedIndex = []
    , a = arguments;

  if (a.length === 1) {
    collection = f(a[0]);
  } else if (a.length === 2) {
    collection = f(a[1], a[0]);
  }

  return collection;

  function f(handler, key) {
    if (key) {
      _.each(self.get(key), function(value, index) {
        if (!handler(value)) {
          removedIndex.push([key + '[' + index + ']', index, value]);
        }
      });

      _.each(_.map(removedIndex, function(val) { return val[1] }).reverse(), function(index) {
        self.get(key).splice(index, 1);
      });

      removedIndex.push([key, '*', self.get(key)]);
    } else {
      _.each(self.target, function(value, index) {
        if (!handler(value)) {
          removedIndex.push([ '[' + index + ']', index, value]);
        }
      });

      self.target = _.filter(self.target, handler);
    }

    _.each(removedIndex, function(item) {
      self.notify(item[0], { operation: 'remove' , oldValue: item[2] });
    });

    return key ? self.get(key) : self.target;
  }
};

module.exports = Glue;
