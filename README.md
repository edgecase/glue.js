# Overview
`glue.js` is a general purpose hash/array observer for Javascript. It
gives users the ability add listeners that executes a callback
particular change occurs on a javascript object.

# Example
Given the following object:

```javascript
var targetObject = { v1: '' };
```

The `target` object can be passed to the Glue constructor to create an instance
of `Glue`.

```javascript
var glue = new Glue(targetObject);

glue.addListener(function() {
  console.log('Target object changed.');
});

glue.set('v1', 'a value'); // 'Target object changed.'
```

In the example above, `"Target object changed."` is logged on the console when
the value of `v1` changed by the `set` operator.

For more examples, please see the specs directory.

# Core methods
##contructor
```javascript
new Glue(targetObject);
```

**targetObject:** the object that will be observed by `Glue`.

##addListener
```javascript
glue.addListener([key(s):operation(s)], [context], callback);
```

**key(s) (optional):** specifies the key or index will have to change for the callback to be executed.
If no key is specified it defaults to the `'*'` key which executes if anything changes on the target object.

**operation(s) (optional):** restricts the callback's execution for a particular operation. (push, pop, etc.)

**context (optional):** the context which the callback is to be executed. By default, callbacks are
executed in the context of the `target` object.

**callback:** the function to be executed when the listener is notified. Callbacks are passed a
message parameter that contains information about what changed on the `key` being listened to.

###Keys
Assume the following array as the target object.

```javascript
var target1 = [1, 2, 3, 4, 5],
    glue = new Glue(target1);
```
then we can declare the following listeners:

```javascript
glue.addListener('[0]', function(message) {
  // callback
});

glue.addListener('[]', function(message) {
  // callback
});

glue.addListener('*', function(message) {
  // callback
});
```

`[0]` is executed only when a change occurs to the first element of the array, `[1]` on the second, and so on.

`[]` is executed for every element that changes in the array.

For example:

```javascript
var messages = [],
    target1 = [1, 2, 3, 4, 5],
    glue = new Glue(target1);

glue.addListener('[]', function(msg) {
  messages.push(msg);
});

glue.filter(function(num) {
  return num % 2 === 0;
});

console.log(messages)

// ------------------------------- messages ---------------------------------
// [
//   { oldValue: 5, currentValue: undefined, index: 4, operation: 'filter' },
//   { oldValue: 4, currentValue: undefined, index: 3, operation: 'filter' },
//   { oldValue: 3, currentValue: undefined, index: 2, operation: 'filter' },
//   { oldValue: 2, currentValue: 4, index: 1, operation: 'filter' },
//   { oldValue: 1, currentValue: 2, index: 0, operation: 'filter' }
// ];
// --------------------------------------------------------------------------
```

Users can add listeners to the array itself like in the example below.

```javascript
var messages = [],
    target1 = [1, 2, 3, 4, 5],
    glue = new Glue(target1);

glue.addListener('*', function(msg) {
  messages.push(msg);
});

glue.filter(function(num) {
  return num % 2 === 0;
});

console.log(messages); // [{ oldValue: [ 1, 2, 3, 4, 5 ], currentValue: [ 2, 4 ], operation: 'filter' }]
```

Since the default key is `'*'` the following example would yeild an identical message

```javascript
glue.addListener(function(msg) {
  messages.push(msg);
});
```

Keys can be assigned to keys of hashes:

```javascript
var messages = [],
    target1 = { arr: [1, 2, 3, 4, 5] },
    glue = new Glue(target1);

glue.addListener('arr[]', function(msg) {
  messages.push(msg);
});

glue.filter('arr', function(num) {
  return num % 2 === 0;
});

console.log(messages)

// ------------------------------- messages ---------------------------------
// [
//   { oldValue: 5, currentValue: undefined, index: 4, operation: 'filter' },
//   { oldValue: 4, currentValue: undefined, index: 3, operation: 'filter' },
//   { oldValue: 3, currentValue: undefined, index: 2, operation: 'filter' },
//   { oldValue: 2, currentValue: 4, index: 1, operation: 'filter' },
//   { oldValue: 1, currentValue: 2, index: 0, operation: 'filter' }
// ];
// --------------------------------------------------------------------------
```

Keys can be nested within a hash of arbitrary complexity:

```javascript
var target5 = { v1: { arr1: [ { v2: { arr2: [ 'something' ] } } ] } };
```

`target5` can have the following keys:

```javascript
'v1.arr1[0].v2.arr2[0]',
'v1.arr1[0].v2.arr2[]',
'v1.arr1[0].v2.arr2',
'v1.arr1[0].v2',
'v1.arr1[0]',
'v1.arr1[]',
'v1.arr1',
'v1',
'*'
```

Note that generic element keys can only be specified if it at the end of the key.

Lastly, multiple keys can be added simultaneously:

```javascript
glue.addListener('v1, v2', callback);
```


###Operation(s)
All keys can be restricted to only execute for a particular operation. For example:

```javascript
glue.addListener('v1:set', function(message) {
  // callback
});
```

Will only be executed if the change on `v1` resulted from a `set` operation. Multiple
operations can be specified per a listener.

```javascript
glue.addListener('v1:set, push, insert', function(message) {
  // callback
});
```

###Context
By default a callbacks are executed in the `context` of the `target` object, but can be specified by following:

```javascript
var myContext = { a: ''};

glue.addListener(myContext, function(message) {
  // "this" in side the callback is myContext
  this.a = 'context';
});
```
When the callback above is executed, `myContext` will have the value `{ a: 'context' }`

The context can be used in conjuction with keys and operations like so:
```javascript
glue.addListener('v1:set', context, function(message) {
  // callback
});
```

The example below demonstrates context.

```javascript
var context = { myWord: 'Oh my' },
    target = { v1: '' },
    glue = new Glue(target);

glue.addListener(context, function(message) {
  this.myWord = message.currentValue;
});

glue.set('v1', 'Hello');

console.log(context); // { myWord: 'Hello' }
```

###Message

Messages are composed depending on the type of key is assigned to the listener.

```javascript
var message,
    target1 = { arr: [1, 2, 3, 4, 5] },
    glue = new Glue(target1);

glue.addListener('arr[2]', function(msg) {
  message = msg;
});

glue.set('arr[2]', 9);

console.log(message); // [{ oldValue: 3, currentValue: 9, operation: 'set' }]
```

On the other hand:

```javascript
var message,
  target1 = { arr: [1, 2, 3, 4, 5] },
  glue = new Glue(target1);


glue.addListener('arr[]', function(msg) {
  message = msg;
});

glue.set('arr[2]', 9);

console.log(message); // { oldValue: 3, currentValue: 9, index: 2, operation: 'set' }
```

And directly to the `target`:

```javascript
var messages = [],
    target1 = { arr: [1, 2, 3, 4, 5] },
    glue = new Glue(target1);


glue.addListener('*', function(msg) {
  messages.push(msg);
});

glue.set('arr[2]', 9);

console.log(message);
// {
//   oldValue: { arr: [ 1, 2, 3, 4, 5 ] },
//   currentValue: { arr: [ 1, 2, 9, 4, 5 ] },
//   operation: 'set'
// }
```

##removeListener
```javascript
glue.addListener([key(s):operation(s))], [context]);
```

**key(s) (optional)**: the key to be removed

**operation(s) (optional)**: the operation to be removed

**context (optional)**: the context to be removed

Example

```javascript
glue.removeListener('key');
glue.removeListener('key1, key2');
glue.removeListener('key1, key2:operation');

glue.removeListener(':operation');
glue.removeListener(':operation1, operation2');

glue.removeListener('key:operation');
glue.removeListener('key:operation, operation2');
glue.removeListener('key1, key2:operation, operation2');

glue.removeListener('key', context);
glue.removeListener(':operation', context);
glue.removeListener('key1, key2:operation', context);
glue.removeListener('key:operation1, operation2', context);
glue.removeListener('key1, key2:operation, operation2', context);
```

# Operations
##set
```javascript
glue.set(key, value);
```

Example:

```javascript
var glue = new Glue({ v1: '' });
glue.set('v1', 'something);

console.log(glue.target); // { 'v1', 'something' }
```

##remove
```javascript
glue.remove(key);
```

Example:

```javascript
var glue = new Glue({ v1: 'something' });
glue.remove('v1'); // 'something'

console.log(glue.target); // {}
```

##push
```javascript
glue.push([key], value);
```

Example:

```javascript
var glue = new Glue([1,2,3]);
glue.push(4)

console.log(glue.target); // [1,2,3,4]
```

##pop
```javascript
glue.pop([key]);
```

Example:

```javascript
var glue = new Glue([1,2,3]);
glue.pop() // 4

console.log(glue.target); // [1,2,3]
```

##insert
```javascript
glue.insert([key], index, value);
```

Example:

```javascript
var glue = new Glue([1,2,3]);
glue.insert(1, 9);

console.log(glue.target); // [1, 9, 2, 3]
```

##filter
```javascript
glue.filter([key], iterator);
```

Example:

```javascript
var glue = new Glue([1,2,3,4,5]);
glue.filter(function(num) {
  return num % 2 === 0;
}); // [2,4]

console.log(glue.target); // [2, 4]
```

###sortBy
```javascript
glue.sortBy([key], iterator);
```
Example

```javascript
var glue = new Glue(_.shuffle(['1elem', '2elem', '3elem', '4elem' ,'5elem']));

glue.sortBy(function(elem) { return parseInt(elem) });
console.log(glue.target); ['1elem', '2elem', '3elem', '4elem' ,'5elem']
```

##swap
```javascript
glue.swap(key1, key2);

Example

```javascript
var glue = new Glue({ v1: '', v2: { v3: 'hello' }});

glue.swap('v1', 'v2.v3');
console.log(glue.target); //{ v1: 'hello', v2: { v3: '' }}
```
