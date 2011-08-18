# glue.js


## The Problem

Say you have a JS object -- let's call it a "view". You want it to react in 
some way whenever a property is modified on some other object -- let's call it 
a "model" -- and you don't want the model to worry about who is watching it. It 
would be super nice if the view could know what was modified in the model 
without having to dive into the models object graph.


## The Solution

Introduce a third object -- a Controller. The Controller is responsible for 
brokering any messages from the model to any other object who wants to receive 
messages.


## (Contrived and Meaningless) Example

```javascript
var project           = { title: 'Hey', stories: [ {title: 'Do stuff', assignee: 'Adam'} ] },
    projectController = new ObjectController(project),
    $myWork           = $('#my_work');

controller.addObserver($myWork, 'stories.assignee', function(msg) {
  // update my work to refect the new assignment
});

$('select[name=assignee]').change(function() {
  projectController.set('stories.assignee', $(this).val());
});
```


## API


### ObjectController

An ObjectController is responsible for managing the state of particular object.  
Receivers register themselves with the ObjectController and will be notified 
when the object's state modified.

```
new ObjectController(obj)
```

Creates a new ObjectController. `obj` can be anything -- a DOM elememt, a 
jQuery object, a Backbone model, a vanilla JS object, etc.

```
#set(key, val)
```

Set a property on the source object. `key` uses dot notation to dive into the 
object graph.

```
#get(key)
```

Get a property from the source object. `key` uses dot notation to dive into the 
object graph.

```
#addObserver(receiver, key, callback)
```

Will notify `receiver` when `key` is modified on the source object. `key` uses 
dot notation to dive into the object graph. `receiver` can be any JS object.  
`callback` is passed a Message object.


### ArrayController

ArrayControllers are just collections of ObjectControllers. They are useful 
when a receiver wants to know when any object in a collection is modified.

```
new ArrayController()
```

Creates a new ArrayController.

```
#add(objectController)
```

`objectController` should be an ObjectController instance. It is added to the 
collection.

```
#addObserver(receiver, key, callback)
```

Will notify `receiver` when `key` is modified on any of the source objects.  
`key` uses dot notation to dive into the object graph. `receiver` can be any JS 
object.  `callback` is passed a Message object.


### Message

Message objects are passed to the callback of an observer.

```
#keyPath
```

The keyPath of the modified property.

```
#object
```

The ObjectController or ArrayController that is invoking the callback.

```
#oldValue
```

The previous value of the modified property.

```
#newValue
```

The new value of the modified property.
