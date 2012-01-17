var Task = function(desc) {
  this.desc = desc;
  this.done = false;
  this.editMode = false;
};

var TodoList = function() {
  this.tasks = [];
};

$(function() {
  var mList = new Glue(new TodoList)
    , vList = new Glui(mList);

  vList.$('#new-task').submit(function(event, glue, data) {
    glue.push('tasks', new Task(data.description));
  });

  vlist.addListener('tasks[]', 'push,remove', function(msg) {
    this.render({ description: msg.newValue });
  });
});

