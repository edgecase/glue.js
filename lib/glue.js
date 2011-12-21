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
  this.target = target;

  this.resetListeners = function() {
    this.listeners = { any: [], assigned: {}, computed: {}, oldValues: {} };
  }

  this.resetListeners();
};

Glue.version = '0.4.3'


// Usage:
// glue.bindTo(target);

Glue.prototype.bindTo = function(target){
};


// Not in the public API. This is intended to be called only
// by operations of glue and no other
//
// Usage:
// glue.notify(key, message);
//
// message: the hash that is passed to the listener

Glue.prototype.notify = function(key, msg, opts) {
};


// Usage:
// glue.addListener([key(s)], [subject], handler);
//
// subject (optional):
//  the context which handler is to be executed. By default
//  it is set to the target object

Glue.prototype.addListener = function() {
};


// Usage:
// glue.removeListener([key(s)], [object]);

Glue.prototype.removeListener = function() {
};


// Not in the public API. It is more performant to access
// values directly through glue.target. However, one should never
// modify the values of a target object obtain directly from
// glue.target.
//
// Usage:
// glue.get(key);

Glue.prototype.get = function(key) {
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

module.exports = Glue;
