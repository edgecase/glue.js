# glue.js

## Overview
`glue.js` is a general purpose hash/array observer for Javascript. It
gives users the ability to register callbacks that are executed when a
particular change occurs.

## Example
Given an the following `target` object:

    var targetObject = { v1: '' };

The `target` object can be passed to the Glue constructor to create an instance
of `Glue`.

    var glue = new Glue(targetObject);

    glue.addListener(function() {
      console.log('Target object changed.');
    });

    glue.set('v1', 'a value'); // 'Target object changed.'

In the example above, `"Target object changed."` is logged on the console when
the value of `v1` changes.

## API
### Core methods
####contructor
    new Glue(targetObject);

`targetObject`: the object that will be observe by `Glue`.

####addListener
    glue.addListener([key(s):operation(s)], [context], callback);

`key(s)` (optional): specifies the key or index the callback listens to. Defaults to any key if the key is not specified.

`operation(s)` (optional): restricts the callback execution for a particular operation. (push, pop, etc.)

`context` (optional): the context which the callback is to be executed. By default, callbacks are executed in the context of the `target` object.

`callback`: the function to be executed when the listener is notified. Callbacks are passed a message parameter that indicates what has changed.

#####Keys
Assume the following array as the target object.

    var target1 = [1, 2, 3, 4, 5],
        glue = new Glue(target1);

then we can declare the following listeners:

    glue.addListener('[0]', function(message) {
      // callback
    });

    glue.addListener('[]', function(message) {
      // callback
    });

    glue.addListener('*', function(message) {
      // callback
    });

`[0]` is executed only when a change occurs to the first element of the array, `[1]` second, and so on.

`[]` is executed for every element that changes in the array.

For example:

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

    // [
    //   { oldValue: 5, currentValue: undefined, index: 4, operation: 'filter' },
    //   { oldValue: 4, currentValue: undefined, index: 3, operation: 'filter' },
    //   { oldValue: 3, currentValue: undefined, index: 2, operation: 'filter' },
    //   { oldValue: 2, currentValue: 4, index: 1, operation: 'filter' },
    //   { oldValue: 1, currentValue: 2, index: 0, operation: 'filter' }
    // ];

On the other hand listener to the array itself would yeild the following:

    var messages = [],
        target1 = [1, 2, 3, 4, 5],
        glue = new Glue(target1);

    glue.addListener('*', function(msg) {
      messages.push(msg);
    });

    glue.filter(function(num) {
      return num % 2 === 0;
    });

    console.log(messages);
    // [{ oldValue: [ 1, 2, 3, 4, 5 ], currentValue: [ 2, 4 ], operation: 'filter' }]

Glue keys can also be assigned to keys of hashes:

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

    // [
    //   { oldValue: 5, currentValue: undefined, index: 4, operation: 'filter' },
    //   { oldValue: 4, currentValue: undefined, index: 3, operation: 'filter' },
    //   { oldValue: 3, currentValue: undefined, index: 2, operation: 'filter' },
    //   { oldValue: 2, currentValue: 4, index: 1, operation: 'filter' },
    //   { oldValue: 1, currentValue: 2, index: 0, operation: 'filter' }
    // ];

Finally, keys can be nested within a hash of arbitrary complexity:

    var target5 = { v1: { arr1: [ { v2: { arr2: [ 'something' ] } } ] } };

`target5` can have the following keys:
    'v1.arr1[0].v2.arr2[0]',
    'v1.arr1[0].v2.arr2[]',
    'v1.arr1[0].v2.arr2',
    'v1.arr1[0].v2',
    'v1.arr1[0]',
    'v1.arr1[]',
    'v1.arr1',
    'v1',
    '*'

Note that generic element keys can only be specified if it at the end of the key.

Multiple keys can be added simultaneously:

    glue.addListener('v1, v2', callback);



#####Operation(s)
All keys can be restricted to only execute for a particular operation. For example:

    glue.addListener('v1:set', function(message) {
      // callback
    });

Will only be executed if the change on `v1` resulted from a `set` operation. Multiple
operations can be specified per a listener.

    glue.addListener('v1:set, push, insert', function(message) {
      // callback
    });

#####Context
The a user's callback will be executed in the `context` of the `target` object, but can be specified by following:

    glue.addListener(context, function(message) {
      // callback
    });

Or for a specific key like so:

    glue.addListener('v1', context, function(message) {
      // callback
    });

The example below demonstrates context.

    var context = { myWord: 'Oh my' },
        target = { v1: '' },
        glue = new Glue(target);

    glue.addListener(context, function(message) {
      this.myWord = message.currentValue;
    });

    glue.set('v1', 'Hello');

    console.log(context); // { myWord: 'Hello' }

#####Message

Messages are composed depending on the type of key is assigned to the listener.

    var message,
        target1 = { arr: [1, 2, 3, 4, 5] },
        glue = new Glue(target1);

    glue.addListener('arr[2]', function(msg) {
      message = msg;
    });

    glue.set('arr[2]', 9);

    console.log(message); // [{ oldValue: 3, currentValue: 9, operation: 'set' }]

On the other hand:

    var message,
        target1 = { arr: [1, 2, 3, 4, 5] },
        glue = new Glue(target1);


    glue.addListener('arr[]', function(msg) {
      message = msg;
    });

    glue.set('arr[2]', 9);

    console.log(message); // { oldValue: 3, currentValue: 9, index: 2, operation: 'set' }

And directly to the `target`:
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

####removeListener
    glue.addListener([key(s):operation(s))], [context]);

`key(s)` (optional): the key to be removed

`operation(s)` (optional): the operation to be removed

`context` (optional): the context to be removed

Example

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


## Operations
###set
    glue.set(key, value);

Example:

    var glue = new Glue({ v1: '' });
    glue.set('v1', 'something);

    console.log(glue.target); // { 'v1', 'something' }

###remove
    glue.remove(key);

Example:

    var glue = new Glue({ v1: 'something' });
    glue.remove('v1'); // 'something'

    console.log(glue.target); // {}
###push
    glue.push([key], value);

Example:

    var glue = new Glue([1,2,3]);
    glue.push(4)

    console.log(glue.target); // [1,2,3,4]
###pop
    glue.pop([key]);

Example:

    var glue = new Glue([1,2,3]);
    glue.pop() // 4

    console.log(glue.target); // [1,2,3]

###insert
    glue.insert([key], index, value);

Example:

    var glue = new Glue([1,2,3]);
    glue.insert(1, 9);

    console.log(glue.target); // [1, 9, 2, 3]

###filter
    glue.filter([key], iterator);

Example:

    var glue = new Glue([1,2,3,4,5]);
    glue.filter(function(num) {
      return num % 2 === 0;
    }); // [2,4]

    console.log(glue.target); // [2, 4]

###sortBy
    glue.sortBy([key], iterator);

Example

    var glue = new Glue(_.shuffle(['1elem', '2elem', '3elem', '4elem' ,'5elem']));

    glue.sortBy(function(elem) { return parseInt(elem) });
    console.log(glue.target); ['1elem', '2elem', '3elem', '4elem' ,'5elem']

###swap
    glue.swap(key1, key2);

Example

    var glue = new Glue({ v1: '', v2: { v3: 'hello' }});

    glue.swap('v1', 'v2.v3');
    console.log(glue.target); //{ v1: 'hello', v2: { v3: '' }}

