var Task = function(desc) {
  this.desc = desc;
  this.done = false;
  this.editMode = false;
};

var Todo = function() {
  this.tasks = [];
};

$(function() {
  var tasks = new Glue(new Todo)
    , g = new Glui(tasks);

  g.$('#new-task').submit(function(data) {
    this.push('tasks', new Task(data.desc));
  });

  tasks.addListener('tasks[]', function() {
  });
});

