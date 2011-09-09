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
<div id='my-word></div>
<div id='my-word-length></div>
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
var controller    = new Glue(project),
    $myWord       = $('#my-word'),
    $myWordLength = $('#my-word-length');

controller.addObserver($myWord, "myString", function(msg) {
  this.html(msg.value);
});

controller.addObserver($myWordLength, "myStringSize()", function(msg) {
  this.html(msg.value);
});

$('input#the-word').change(function() {
  controller.set('myTask.title', $(this).val());
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
new Glue([obj])
```

Creates a new Glue instance. `obj` can be any valid JavaScript object (though, observing a 
Function Object will not get you very far...) -- a DOM element, a jQuery object, a Backbone 
model, a vanilla JS object, JS arrays, JS literals, etc.

### addListener
```javascript
addListener([listener, ] [keyPath, ] callback)
```
#### Sample Usage

```javascript
 glue.addListener(function(msg) {
  // callback
});

glue.addListener(anObject, function(msg) {
  // callback
});

glue.addListener(function(msg) {
  // callback
}, 'keyPath');

topic.addListener(anObject, 'keyPath', function(msg) {
  // callback
});
```

Will notify the `listener` when `keyPath` is modified on the source object. `keyPath` uses 
dot notation to dive into the object graph. `observer` can be any JS object. `callback` 
is executed in the context of the `boundObject` and passed an argument that contains 
the old, and new value of the attribute specified by the `keyPath`.

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
A `keyPath` is a string that 


If a `keyPath` is not passed it is assigned to the `'*'`
`keyPath`, which will notify a listener whenever any attribute is set or modified on the
boundObject.

For example you can:

```javascript
glue.addListener({my: 'listener'}, function() {
  // the callback
});
```

```javascript
bindTo(objectToObserve)
```

When you pass an object instance to the Glue's construtor, you are, in effect, calling
the bindTo function. It establishes the object that Glue is managing. This value 
can be set at anytime but be aware of the implecations of doing so. The observers are NOT 
removed from the Controller when bindTo is invoked and it's incumbant upon the caller to 
either remove them or not.

```javascript
set(keyPath, newValue)
```

Set a property on the source object. `keyPath` uses dot notation to dive into the 
object graph.

```javascript
#get(keyPath)
```

Get a property from the source object. `keyPath` uses dot notation to dive into the 
object graph.


### ArrayController

ArrayControllers are a simple abstraction to provide a way to observe collections.

NOTE: you cannot observe objects inside of the ArrayController as of the time of writing this
NOTE FOR ABOVE NOTE: it will happen.

```javascript
#new ArrayController([optionalArrayOfObjects])
```

Creates a new ArrayController.
optionalArrayOfObjects, if omitted, will default to a new JavaScript array.

```javascript
#add(objectController)
```

`objectController` is an ObjectController instance added to the observed collection.
  If the objected added to the collection is not observable, a new ObjectController is
  created and the object is bound to it. This newly wrapped object is then added to the 
  observed collection prior to notifying the listeners. Allowing observers of the 
  collection a chance to observe the newly added item in the collection.

```
#addObserver(observer, [keyPath,] callback)
```
Registers `observer` with the Controller. When `keyPath` is modified the `callback`
is invoked in the context of the `observer` (e.g. `this` becomes the `observer`)

#### Arguments
`observer`: a JavaScript object interested in changes to the Controller's object.
`keyPath`(optional): the property of interest to the `observer` in the Controller's object.
`callback`: the function invoked when Controller's object is agumented at the `keyPath`
            All callbacks are invoked using the `observer` as the ThisBinding context.

```
### Note on ArrayController keyPaths
```
The following are valid observable keyPaths in ArrayController:
`add, remove, replace`

Omitting the keyPath or using `*` implies that the `observer` is listening to all
changes.

```
### Note on ObjectController keyPaths:
```
In ObjectControllers the `keyPath` uses dot notation to traverse the object graph.
`observer` can be any JS object. `callback` is passed a Message object.

Valid keyPath examples would be: "family.tree.mother" but not "family.tree.myCrazyMethod()"
That said, you can do this. controllerInstance.get("family.tree.myCrazyMethod")()
and it will work but the context of the call may be lost... but you can send it in with call/apply if you
still have a reference to the property ThisBinding context. 

```
### Example keyPaths
```
var people = [
  { "name":"Leon", "age":30, "address":{ "state":"OH", "zip":32016 } },
  { "name":"Felix", "age":20, "address":{ "state":"OH", "zip":32016 } }
  { "name":"Adam", "age":30, "address":{ "state":"OH", "zip":32016 } }
  { "name":"Marc", "age":30, "address":{ "state":"OH", "zip":32016 } }
  { "name":"Justine", "age":20, "address":{ "state":"OH", "zip":32016 } }
  { "name":"Jerry", "age":20, "address":{ "state":"OH", "zip":32016 } }
]

var personCounter = 0;
var peopleController = new ArrayController(people);
arrayController.addObserver(personCounter, "add", function(msg){
  this = msg.currentCount;
});

var jerry = { "name":"Jerry", "age":20, "address":{ "state":"OH", "zip":32016 } }
var jerryController = new ObjectController(jerry)

jerryController.addObserver(console, "name", function(msg){
  this.log("Jerry changed his name from "+msg.oldValue+" to "+ msg.newValue);
});

jerryController.addObserver(console, "address.zip", function(msg){
  this.log("Jerry changed his zip from "+msg.oldValue+" to "+ msg.newValue);
});

See the examples for more uses of keyPath.
### Message(ObjectController)

Message objects are passed to the callback of an observer.

```javascript
#keyPath
```

The keyPath of the modified property.

```javascript
#object
```

The ObjectController that is invoking the callback.

```javascript
#oldValue
```

The previous value of the modified property.

```javascript
#newValue
```

The new value of the modified property.


### Message(ArrayController)
Message objects are passed to the callback of an observer.

```
#keyPath
```

The keyPath of the modified collection.

```
#object
```

The ArrayController that is invoking the callback.

```
#currentCount
```

The current count, provided so that the caller will not need to needlessly
overcompute or overmemoize simple calculations.

