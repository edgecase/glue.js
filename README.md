# Overview
`glue.js` is a general purpose hash/array observer for Javascript. It
gives users the ability to add listeners to object properties, and automatically
execute them when that property changes.

# Basic Use
Given the following object:

```javascript
var targetObject = { v1: '' };
```

The `target` object can be passed to the Glue constructor to create an instance
of `Glue`.

```javascript
var glue = new Glue(targetObject);

glue.addListener("*", function() {
  console.log('Target object changed.');
});

glue.set('v1', 'a value'); // 'Target object changed.'
```

In the example above, `"Target object changed."` is logged on the console when
the value of `v1` changed by the `set` operator.

For more examples, please see the specs directory.

###Keys
Keys are a core concept in Glue, for both listeners and operations (ie: set).

```javascript
var target = {
  name: "Felix",
  contact: {
    phone: "555-555-5555",
    email: "felix@edgecase.com"
  }
}

var glue = new Glue(target);
```

```javascript
glue.addListener("", function(message) {
  // callback will be triggered on any modification
  // ex: glue.set("name", "foo");
  // ex: glue.set("contact.email", "foo@edgecase.com");
});
```

```javascript
glue.addListener("contact", function(message) {
  // callback will be triggered on any modification to the contact property
  // ex: glue.set("contact", {});
  // ex: glue.set("contact.email", "foo@edgecase.com");

  // callback will not be triggered on modification of other properties
  // ex: glue.set("name", "foo");
});
```

```javascript
glue.addListener("contact.email", function(message) {
  // callback will be triggered on any modification to the email property of the contact object.
  // ex: glue.set("contact.email", "foo@edgecase.com");

  // callback will not be triggered on modification of other properties
  // ex: glue.set("contact.phone", "123-456-7890");
});
```

####Array Specific Keys
Assume the following target

```javascript
var target1 = [1, 2, 3, 4, 5];
var glue = new Glue(target1);
```

```javascript
glue.addListener('[2]', function(message) {
  // callback is executed only when a change occurs to the element at index 2 of the array.
});
```

```javascript
glue.addListener('[]', function(message) {
  // callback is executed for every element that changes in the array.
});
```

####Additional Examples
```javascript
var target = { v1: { arr1: [ { v2: { arr2: [ 'something' ] } } ] } };
var glue = new Glue(target);
```

The following keys can be used:

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

Note that generics `[]` can only be at the end of the key.
Example: `'v1.arr1[0].arr2[]'` is legal, but `'v1.arr1[].arr2[]'` is not

# Core methods
##Constructor
```javascript
new Glue(targetObject);
```

**targetObject:** the object that will be observed by `Glue`.

##addListener
```javascript
glue.addListener([key(s):operation(s)], [context], callback);
```

**key(s) (optional):** specifies the key or index that will be observed by the listener.

**operation(s) (optional):** restricts the callback's execution for a particular operation. (push, pop, etc.)

**context (optional):** the context which the callback is to be executed. By default, callbacks are
executed in the context of the `target` object.

**callback:** the function to be executed when the listener is notified. Callbacks are passed a
message parameter that contains information about what changed on the `key` being listened to.

###Examples

Setting a listen for a key:

```javascript
glue.addListener('v1', callback);
```

Setting a listener for multiple keys:

```javascript
glue.addListener('v1, v2', callback);
```

Setting a listener for a specific operation:

```javascript
glue.addListener('v1:set', function(message) {
  // callback
});
```

Setting a listener for multiple operations:

```javascript
glue.addListener('v1:set, v2:push, :insert', function(message) {
  // callback
});
```

###Context
By default all callbacks are executed in the `context` of the `target` object, but can be specified by following:

```javascript
var myContext = { a: ''};

glue.addListener(myContext, function(message) {
  // "this" in side the callback is myContext
  this.a = 'context';
});
```
When the callback above is executed, `myContext` will have the value `{ a: 'context' }`

The context can be used in conjunction with keys and operations as follows:

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
  this.myWord = message.value;
});

glue.set('v1', 'Hello');

console.log(context); // { myWord: 'Hello' }
```

###Messages
A message object is passed to the listener callback function.

####Basic Messages

```javascript
var messages = [],
    target1 = { foo: "bar" },
    glue = new Glue(target1);


glue.addListener('*', function(msg) {
  console.log(message);
});

glue.set('foo', 'baz');

// Output
// {
//   value: "baz",
//   operation: 'set'
// }
```

####Array Specific messages

Messages content depend on the type of key is assigned to the listener.

```javascript
var message,
    target1 = { arr: [1, 2, 3, 4, 5] },
    glue = new Glue(target1);

glue.addListener('arr[2]', function(msg) {
  message = msg;
});

glue.set('arr[2]', 9);

console.log(message); // [{ value: 9, operation: 'set' }]
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

console.log(message); // { value: 9, index: 2, operation: 'set' }
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
//   value: { arr: [ 1, 2, 9, 4, 5 ] },
//   operation: 'set'
// }
```

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
//   { value: undefined, index: 4, operation: 'filter' },
//   { value: undefined, index: 3, operation: 'filter' },
//   { value: undefined, index: 2, operation: 'filter' },
//   { value: 4, index: 1, operation: 'filter' },
//   { value: 2, index: 0, operation: 'filter' }
// ];
// --------------------------------------------------------------------------
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

##set
```javascript
glue.set(key, value);
```

Example:

```javascript
var glue = new Glue({ v1: '' });
glue.set('v1', 'something');

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
console.log(glue.target); //['1elem', '2elem', '3elem', '4elem' ,'5elem']
```

##swap
```javascript
glue.swap(key1, key2);
```
Example

```javascript
var glue = new Glue({ v1: '', v2: { v3: 'hello' }});

glue.swap('v1', 'v2.v3');
console.log(glue.target); //{ v1: 'hello', v2: { v3: '' }}
```
