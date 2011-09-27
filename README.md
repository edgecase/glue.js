# glue.js

## The Problem

Say you have a JS object -- let's call it a "view". You want it to react in 
some way whenever a property is modified on some other object -- let's call it 
a "model" -- and you don't want the model to worry about who is watching it. It 
would be super nice if the view could know what was modified in the model 
without having to dive into the models object graph.


## The Solution

Introduce a third object -- Glue. Glue is responsible for 
brokering any messages from the model to any other object who wants to receive 
messages.


## Example
Let's say you have a project that uses jQuery, with the following markup.

```html
<input type='text' id='the-word'></input>
<div id='my-word'></div>
<div id='my-word-length'></div>
```

You also have a `model` object.

```javascript
var model = {
  myString: '',
  myStringSize: function() {
    return this.myString.length;
  };
```
Now let's wire it all up using `Glue`.

```javascript
var controller    = new Glue(model),
    $myWord       = $('#my-word'),
    $myWordLength = $('#my-word-length');

controller.addObserver($myWord, "myString", function(msg) {
  this.html(msg.value);
});

controller.addObserver($myWordLength, "myStringSize()", function(msg) {
  this.html(msg.value);
});

$('input#the-word').change(function() {
  controller.set('myString', $(this).val());
});
```

Now everytime the user types into the text field `$myWord` and `$myWordLength` will be
updated.

## API

### Constructor
Glue is responsible for managing the state of particular object "aka: the `boundObject`"
Observers register themselves with Glue and will be notified when the object's state 
modified in the scope of their `keyPath`.

```javascript
new Glue(obj)
```

Creates a new Glue instance. `obj` can be any valid JavaScript object (though, observing a 
Function Object will not get you very far...) -- a DOM element, a jQuery object, a Backbone 
model, a vanilla JS object, JS arrays, JS literals, etc.

### addListener
```javascript
addListener([listener, ] [keyPath, ] callback)
```

Will notify the `listener` when `keyPath` is modified on the source object. `keyPath` uses 
dot notation to dive into the object graph. `observer` can be any JS object. `callback` 
is executed in the context of the `boundObject` and passed an argument that contains 
the old, and new value of the attribute specified by the `keyPath`.

#### Sample Usage

```javascript
glue.addListener(function(msg) {
  // callback
});

glue.addListener(function(msg) {
  // callback
}, 'keyPath');

glue.addListener(anObject, function(msg) {
  // callback
});

topic.addListener(anObject, 'keyPath', function(msg) {
  // callback
});
```

#### listener (optional)
Whenever a listener is added to an instance of Glue, it is assigned to a `keyPath`, which 
indicates to Glue how to access the attribute the listener wants to be notified 
about.

For example, lets say you have `var fooObject = {foo: 'object'}` which was passed to
`new Glue(fooObject)`, if you add a listener such as this:

```javascript
glue.addListener({my: 'listener'}, "foo", function() {
  // the callback
});
```

Whenever the key `foo` is modified, the callback of will be executed.

#### keyPath (optional)
A `keyPath` is a string that indicates to glue how to access an attribute of the `boundObject`.

For example, let's say you have:
```javascript
var obj = {
  foo: 'this is great'
}
```
The `keyPath` for `foo` would be `'foo'`.

`keyPath`s can be chained (ex `'foo.bar'`);

`keyPath`s can be calculated and function attributes.

Let's say you have `var anObject = {foo: "string"}`. This means that `anObject.foo` has a 
calculated attribute `length`. The keyPath for `foo`'s length would be `foo.(length)`.

On the other hand let's say that you have:

```javascript
var anObject = {
  foo: "string",
  fooLength = function() {
    this.foo.length
  }
```
You can listen to `fooLength()` with the keyPath `fooLength()`.

If a `keyPath` is not passed it is assigned to the `'*'`
`keyPath`, which will notify a listener whenever any attribute is set or modified on the
boundObject.

#### Note
If a `keyPath` is pointing to a calculated attribute or a function, they must be pure 
functions. Augmentations to the `boundObject` object that resulted from the invocation of
a non-pure `keyPath` could be unreported to listeners.

#### callback
The `callback` is the function that is executed when a the listener is notified by glue.
All `callback`s are invoked in the context of the listener object, meaning that `this` 
inside the `callback` is the listener object.

For example:

```javascript
var anObject = {bar: 'listener'};

glue.addListener(anObject, "foo", function() {
  this.bar; // this is anObject, and this.bar is equivalent to anObject.bar
});
```

`callback`s are also passed a message argument that contains the old and new value of 
the attribute specified by the `keyPath`.

```javascript
glue.addListener({an: 'object'}, 'foo' function(msg) {
  msg.oldValue; // this is the old value of the attribute specified by the keyPath on the boundObject
  msg.value; // this is the new value of the attribute specified by the keyPath on the boundObject
});
```

### set('keyPath', newValue)
Sets a property on the `boundObject` specified by the `keyPath`, and notifies `boundObject`s that
the value of the attribute has changed.

```javascript
var glue = new Glue({level1: {level2: ''}}).
    callbackInvoked = false;

glue.addListener(function() {
  callbackInvoked = true;
});

glue.set('level1.level2', 'two levels');
// => glue.getBoundObject().level1.level2 === "two levels"
// => callbackInvoked === true
```

### get('keyPath', newValue)
Gets a property on the `boundObject` specified by the `keyPath`.

```javascript
var topic = new Glue({
  foo: {
    bar: function() {
      return { baz: 3 };
    }
  }
});

topic.get("foo.bar().baz");
// => 3
```

### getBoundObject()
Returns a clone of the bound object

```javascript
var controller = new Glue({foo: 1}),
    boundObject = controller.getBoundObject();

// => boundObject.foo === 1;
```

### removeListener([[boundObject,] keypath, ] [keyPath, ])
Removes listener(s) to the `boundObject` on the a `Glue` instance.

#### Sample Usages
```javascript
glue.removeListener();

glue.removeListener(anObject);

glue.removeListener(anObject, "bar()");

glue.removeListener({keyPath: "bar()"});
```

### bindTo(objectToObserve)

When you pass an object instance to the `Glue`'s construtor, you are, in effect, calling
the `bindTo` function. It establishes the object that `Glue` is managing. This value 
can be set at anytime but be aware of the implecations of doing so. The observers are NOT 
removed from the `glue` instance when bindTo is invoked and it's incumbant upon the caller to 
either remove them or not.

You can add a listener to the `keyPath` of the `boundObject` and assign a `callback` to 
handle the change.

Example:
```javascript
glue.addListener(function() {
  // your callback
}, "boundObject");
```
