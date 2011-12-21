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

};

Glue.version = '0.4.3'

/*
*   Usage:
*
*   topic.bindTo(obj);
*/

Glue.prototype.bindTo = function(target){
};

/*
*   Not in the public API.
*/

Glue.prototype.notify = function(key, msg, opts) {
};

/*
*   Usage:
*
*   topic.addListener(handler);
*   topic.addListener('*', handler);
*   topic.addListener('v1' handler);
*   topic.addListener(obj, handler);
*   topic.addListener('v1', obj, handler);
*   topic.addListener('v1.v2', obj, handler);
*   topic.addListener('v1#computed', obj, handler);
*   topic.addListener('v1, v2', handler);
*   topic.addListener('v1, v2', obj, handler);
*/

// topic.addListener('[], handler);
// topic.addListener('arr[], handler);
// topic.addListener('v1.arr[], handler);


Glue.prototype.addListener = function() {
};

/*
* Usage
*
* topic.removeListener();
* topic.removeListener('*');
* topic.removeListener('v1');
* topic.removeListener('v1', obj);
* topic.removeListener('v1#computed');
* topic.removeListener('v1#computed', obj);
* topic.removeListener('v1, v2');
* topic.removeListener('v1, v2', obj);
*/

Glue.prototype.removeListener = function() {
};

/*
* Not in the public API.
*
* To access values on the target object use topic.target.attr
* instead of glue.get('attr'))
*/

Glue.prototype.get = function(key) {
};

/*
* Usage
*
* topic.set('v1', 'foo');
* topic.set('v1.v2', 'foo';
* topic.set('v1.v2.v3', 'foo');
* topic.set('[0]', 'foo');
* topic.set('arr[0]', 'foo');
* topic.set('v1.arr[0]', 'foo');
* topic.set('v1.arr[0].v2', 'foo');
* topic.set('v1, v2', 'foo');
*/

Glue.prototype.set = function(keys, value) {
};

/*
* Usage
*
* topic.remove('v1');
* topic.remove('[i]');
* topic.remove('arr[i]');
* topic.remove('v1.arr[i]');
* topic.remove('v1.arr[i].v2');
* topic.remove('arr[i].arr');
* topic.remove('v1, v2');
*/
Glue.prototype.remove = function(keys){
};


/*
* Usage
*
* topic.push('foo');
* topic.push('arr', 'foo');
* topic.push('v1.arr', 'foo');
* topic.push('arr1[i].arr2', 'foo');
* topic.push('arr1, arr2', 'foo');
*/

Glue.prototype.push = function() {
};

/*
* Usage
*
* topic.pop();
* topic.pop('arr');
* topic.pop('v1.arr');
* topic.pop('arr1[i].arr');
*/

Glue.prototype.pop = function(){
};

/*
* Usage
*
* topic.filter(handler);
* topic.filter('col', handler);
* topic.filter('v1.col', handler);
* topic.filter('arr[i].col', handler);
*/
Glue.prototype.filter = function() {
};

module.exports = Glue;
