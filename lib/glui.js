var Glui = function(glue) {
  this.glue = glue;
  this.selector;
};

Glui.prototype.$ = function(selector) {
  this.selector = selector;
  return this;
};

// Algorithm derived from:
// http://stackoverflow.com/questions/1184624/serialize-form-to-json-with-jquery
Glui.serialize = function($form) {
  var o = {};

  _.each($form.serializeArray(), function(input) {
    if (o[input.name]) {
      if (!o[input.name].push) {
        o[input.name] = [o[input.name]];
      }
      o[input.name].push(input.value || '');
    } else {
      o[input.name] = input.value || '';
    }
  });

  return o;
};

Glui.prototype.submit = function(callback, opts) {
  var self = this;

  opts = _.defaults({ resetOnSubmit: true }, opts);

  $(this.selector).on('submit', function(e) {
    e.preventDefault();
    callback.call(self.glue, Glui.serialize($(this)), e);

    if (opts.resetOnSubmit) this.reset();
  });

  return this;
};
