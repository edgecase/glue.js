var _ = require('underscore');

// Glue is an object listener library for javascript.
//
// For example, the value of 'v1' of hash:
// {v1: 'value'}
//
// Can be observe with key:
// "v1"
//
// Objects can be arbitrarily complex. For example, one can observe 'value'
// within this structure:
//
// {v1: arr1: [{v2: v3: arr2: ['value']}]}
//
// with the key:
// 'v1.arr1[0].v2.v3.arr2[0]'
//
// Similarly one can observe an arbitrary element of arr2 with the key:
// 'v1.arr1[0].v2.v3.arr2[]'
//
// And of course one can observe the array itself with the key:
// 'v1.arr1[0].v2.v3.arr'
//
// Possible values for key:
// '*':               any key
// 'v1':              target: {v1: 'foo'}
// 'v1.v2':           target: {v1: {v2: {...}}
// '[]':              target: []
// 'arr':             target: {arr: []}                 * the array itself
// 'arr[]':           target: {arr: []}                 * targets the elements of the array
// 'v1.arr:           target: {v1: {arr: []}}
// 'arr[i].v1.arr     target: {arr: [{v1: arr: []}]}
// 'arr[i].v1.arr[]   target: {arr: [{v1: arr: []}]}
//
// And any other permutations of the combinations describe
// above nested n layers deep (ex. 'v1.v2.v3.arr[i].v4 ...)

(function() {
  var root = this;

  var Glue = function(target) {
    this._keys = undefined;
    this.target = target;

    this.resetListeners = function() {
      this.listeners = { any: [], assigned: {}, computed: {} };
    }

    this.resetListeners();
  };

  Glue.version = '0.4.3'

  Glue.events = {};

  // Usage:
  // glue.addListener([key(s):operation(s)], [context], listener)

  Glue.prototype.addListener = function() {
    var self = this,
        a    = arguments;

    if (a.length === 1) {
      add('*', a[0], this.target);
    } else if (a.length === 2) {
      _.isString(a[0]) ?  add(a[0], a[1], this.target) : add('*', a[1], a[0]);
    } else {
      add(a[0], a[2], a[1]);
    }

    function add(keysAndOperations, listener, context) {
      keysAndOperations = keysAndOperations.replace(/\s/g, '').split(':');

      var keys       = keysAndOperations[0] || '*',
          operations = keysAndOperations[1];

      _.each(keys.split(','), function(key) {
        var l = {listener: listener};

        if (operations) l.operations = operations.split(',');
        if (context) l.context = context;

        if (key === '*') {
          self.listeners.any.push(l);
        } else {
          var type = 'assigned';

          if (key.match(/\#/)) {
            type = 'computed';
            l.oldValue = self.get(key);
          }

          self.listeners[type][key] = self.listeners[type][key] || [];
          self.listeners[type][key].push(l);
        }
      });
    }
  };

  // Usage:
  // glue.removeListener((key(s):operation(s)), [context]);
  // TODO refactor this crap

  Glue.prototype.removeListener = function() {
    var self = this,
        a    = arguments;

    if(a.length === 0) {
      normalize('*');
    } else if (a.length === 1) {
      _.isString(a[0]) ? normalize(a[0]) : normalize('*', a[0]);
    } else if (a.length === 2) {
      normalize(a[0], a[1]);
    }

    function normalize(keysAndOperations, context) {
      keysAndOperations = keysAndOperations.replace(/\s/g,'').split(':');

      var keys       = keysAndOperations[0],
          operations = keysAndOperations[1];

      if (keys) {
        _.each(keys.replace(/\s/g, '').split(','), function(key) {
          remove(key, operations, context);
        });
      } else {
        remove(keys, operations, context);
      }
    };

    function remove(key, operations, context) {
      if (operations) operations = operations.split(',');

      if (key === '*') {
        self.listeners.any = rejectListeners(self.listeners.any);

        _(['assigned', 'computed']).each(function(type) {
          _.each(self.listeners[type], function(listeners, key) {
            self.listeners[type][key] = rejectListeners(listeners);
            removeIfEmpty(self.listeners[type], key);
          });
        });
      } else {
        var type = key && key.match(/\#/) ? "computed" : "assigned";

        self.listeners[type][key] = rejectListeners(self.listeners[type][key]);
        removeIfEmpty(self.listeners[type], key);
      }

      function removeIfEmpty(listeners, key) {
        if (_.isEmpty(listeners[key])) delete listeners[key];
      }

      function rejectListeners(listeners) {
        listeners = _.reject(listeners, function(listener) {
          var hasOperation = !_.isEmpty(operations);

          if (hasOperation && context) {
            if(!_.isEmpty(listener.operations)) {
              listener.operations = _.difference(listener.operations, operations);
              return _.isEmpty(listener.operations) && listener.context === context;
            }
          } else if (context) {
            return listener.context === context;
          } else if (hasOperation) {
            if(!_.isEmpty(listener.operations)) {
              listener.operations = _.difference(listener.operations, operations);
              return _.isEmpty(listener.operations);
            }
          } else {
            return true;
          }
        });

        return listeners;
      };
    };
  };

  // Not in the public API.
  //
  // Usage:
  // glue.notify([key], operation, original, current, changes);

  Glue.prototype.notify = function(operation, original, current, changes) {
    var self = this;

    _notify(changes);
    notifyAnyKey();
    notifyComputed();

    function _notify(changes) {
      currentKey(changes[0]).match(/\]$/) ? notifyCollection(changes) : notifyHash(changes[0]);
    }

    function notifyCollection(changes) {
      var key;

      _.each(changes, function(change) {
        var message = {operation: operation};
        key = currentKey(change);

        _(['old', 'current']).each(function(at) {
          if (change[at]) {
            message[at + 'Value'] = self.get(change[at], at === 'old' ? original : current);
            message[at + 'Index'] = parseInt(change[at].match(/\[(\d*)]$/)[1]);
          }
        });

        invoke(key, message); // specific
        invoke(key.replace(/\d*(?=\]$)/, ''), message); // generic
      });

      key = currentKey(changes[0]).replace(/\[[^\[]*\]$/, '');
      _notify([{ old: key, current: key}]);
    };

    function notifyHash(change) {
      var key = currentKey(change),
          message = { operation: operation };

      _(['old', 'current']).each(function(at) {
        if (change[at]) message[at + 'Value'] = self.get(change[at], at === 'old' ? original : current);
      });

      invoke(key, message);

      key = _.initial(key.split('.')).join('.');
      if (key) _notify([{old: key, current: key}]);
    };

    function invoke(key, message) {
      _.each(self.listeners.assigned[key], function(listener) {
        if (operation && listener.operations) {
          if (_.include(listener.operations, operation)) callListener(listener, message);
        } else {
          callListener(listener, message)
        }
      });
    };

    function notifyAnyKey() {
      var message = {
        operation: operation,
        oldValue: original,
        currentValue: current
      };

      _.each(self.listeners.any, function(listener) {
        callListener(listener, message);
      });
    };

    function notifyComputed() {
      var message = { operation: operation };

      _.each(self.listeners.computed, function(listeners, key) {
        message.oldValue = self.get(key, original);
        message.currentValue = self.get(key, current);

        _.each(listeners, function(listener) {
          callListener(listener, message);
        });
      });
    };

    function currentKey(change) {
      return change.old ? change.old : change.current;
    };

    function callListener(listener, message) {
      if (message.oldValue !== message.currentValue) {
        listener.listener.call(listener.context, message);
      }
    };
  };

  // Type: Scalar/Collection
  //
  // Not in the public API. It is more performant to access
  // values directly through glue.target. However, one should never
  // modify the values of a target object obtain directly from
  // glue.target.
  //
  // Usage:
  // glue.get(key);

  Glue.prototype.get = function(key, obj) {
    var target = obj || this.target;

    key = key.replace(/\s/g,'').replace('#','.');
    key = (_.isArray(target) ? "target" : "target.") + key;

    return eval(key); // I know eval is generally evil, but I think it's acceptable for this use case.
  };

  // Type: Collection
  //
  // Usage
  // topic.push([key], value);

  Glue.prototype.push = function() {
    var self = this,
        a = arguments;

    if (a.length === 1) {
      push('target', this.target, a[0]);
    } else {
      push(a[0], self.get(a[0]), a[1]);
    }

    function push(key, collection, item) {
      var original = _.clone(collection),
          current;

      collection.push(item);
      current = _.clone(collection);

      self.notify("push", original, current, [
        { current: '[' + ++this.target.length + ']' }
      ]);
    };

    return this;
  };


  // CommonJS
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Glue;
    }
    exports.Glue = Glue;
  } else if (typeof define === 'function' && define.amd) {
    // Register as a named module with AMD.
    define('Glue', function() {
      return Glue;
    });
  } else {
    // Exported as a string, for Closure Compiler "advanced" mode.
    root['Glue'] = Glue;
  }
}).call(this);

// // Type: Collection
// //
// // Usage
// // glue.pop([key]);
// 
// Glue.prototype.pop = function(){
// };
// 
// 
// // Type: Collection
// //
// // Usage
// // glue.insert([key], index, value);
// 
// Glue.prototype.insert = function(){
// };
// 
// // Type: Collection
// //
// // Usage
// // glue.filter([key], handler);
// 
// Glue.prototype.filter = function() {
// };
// 
// 
// // Type: Collection
// //
// // Usage
// // glue.sort([key], handler);
// 
// Glue.prototype.sort = function() {
// };
// 
// // Type: Scalar/Collection
// //
// // Usage:
// // glue.set(key, value);
// 
// Glue.prototype.set = function(keys, value) {
// };
// 
// // Type: Scalar/Collection
// //
// // Usage
// // glue.remove([key]);
// 
// Glue.prototype.remove = function(keys){
// };
// 
// 
// // Type: Scalar/Collection
// //
// // Usage
// // glue.sort(origin, destination);
// 
// Glue.prototype.swap = function() {
// };
