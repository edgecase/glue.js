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
    var keysAndOperations = keysAndOperations.replace(/\s/g, '').split(':'),
        keys = keysAndOperations[0] || '*',
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

Glue.prototype.removeListener = function() {
};


// Not in the public API.
//
// Usage:
// glue.notify(key, message);

Glue.prototype.notify = function(key, msg, opts) {
};


// Usage:
// glue.setTarget(target);

Glue.prototype.setTarget = function(target){
};

// Not in the public API. It is more performant to access
// values directly through glue.target. However, one should never
// modify the values of a target object obtain directly from
// glue.target.
//
// Usage:
// glue.get(key);

Glue.prototype.get = function(key) {
  key = key.replace(/\s/g,'').replace('#','.');

  if (key.length > 0) {
    key = (_.isArray(this.target) ? "this.target" : "this.target.") + key;
  } else {
    key = "this.target";
  }

  // I know eval is generally evil, but I think it's acceptable
  // for this use case.
  return eval(key);
};

// Usage:
// glue.set(key, value);

Glue.prototype.set = function(keys, value) {
};


// Usage
// glue.remove([key]);

Glue.prototype.remove = function(keys){
};


// Usage
// topic.push([key], value);

Glue.prototype.push = function() {
};


// Usage
// glue.pop([key]);

Glue.prototype.pop = function(){
};


// Usage
// glue.filter([key], handler);

Glue.prototype.filter = function() {
};


// Usage
// glue.sort([key], handler);

Glue.prototype.sort = function() {
};

module.exports = Glue;
