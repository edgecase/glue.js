# Working on this documentation as we speak.

# glue.js

## Overview
`glue.js` is a general purpose hash and array observer for Javascript. It
gives users the ability to register a callback that are executed when a
particular change occurs to the target object.

## Example
Given an the following `target` object:

    var targetObject = { v1: '' };

The `target` object can be passed to the Glue constructed creating an instance
of `Glue`.

    var glue = new Glue(targetObject);

    glue.addListener(function() {
      console.log('Target object changed.');
    });

    glue.set('v1', 'a value'); // 'Target object changed.'

In the example above, `"Target object changed."` is logged into the console when
the value of `v1` changed.

## API
### Core methods
####contructor
    new Glue(targetObject);

`targetObject`: the object that will be observe by `Glue`.

####addListener
    glue.addListener([key(s):operation(s)], [context], callback);

`key(s)` (optional): specifies the key or index the callback listens to. Defaults to any key, explicitly defined with ('*'), if the key is not specified.

`operation(s)` (optional): restricts the callback to only trigger on a particular operation. (push, pop, etc.)

`context` (optional): the context which the callback is to be executed. By default callbacks are executed within the context of the `target` object.

`callback`: the function to be executed when the listener is notified.

#####Keys
Assume the following is the target object.

    var target1 = [];

Keys can be specified on 3 different levels – element, generic element, and collection level.

    glue.addListener('[0]', function(message) {
      // callback
    });

The listener above would be invoked when the value at index `0` is modified. If a user
wants to listen for changes on an element on generically the following can be specified.

    glue.addListener('[]', function(message) {
      // callback
    });

The message to the callback above is identical to the first example, the listener is generically
bound to the array.

To listen to the array on a collection level the following can be used:

    glue.addListener(function(message) {
      // callback
    });

    // --------------- or ---------------- //

    glue.addListener('*', function(message) {
      // callback
    });

The message passed to the callback would pertain to changes on the entire array rather than on an element level.

Arrays can be nested within an object. For example:

    var target2 = { arr: [] };

The following can be specified:

    glue.addListener('arr[0]', function(message) {
      // callback
    });

    glue.addListener('arr[]', function(message) {
      // callback
    });

    glue.addListener('arr', function(message) {
      // callback
    });

The last example above also demonstrates that listeners can specified for a key in a hash. For example:

    var target3 = { v1: '' };

Can have the following listener:

    glue.addListener('v1', function(message) {
      // callback
    });

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

#####Operation(s)
All keys can be restricted to only execute for a particular operation. For example:

    glue.addListener('v1:set', function(message) {
      // callback
    });

Will only be executed if the change on `v1` resulted from a `set` operation. Multiple
operation can be specified for a listener.

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



####removeListener
    glue.addListener(key(s):operation(s)), [context]);

    operation(s)

### Operations
push (documentation needed)
pop (documentation needed)
insert (documentation needed)
filter (documentation needed)
set (documentation needed)
remove (documentation needed)
