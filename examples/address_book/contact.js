var ContactInfoWithType = function(info) {
  this.primary = info.primary;
  this.type = info.type;
  this.value = info.value;
}

var Contact = function() {
  this.firstname = "";
  this.lastname  = "";
  this.family = {
    tree:{
      mother: "Sue",
      father: "Bob"
    }
  };
  this.emails = []
  this.phones = [];
};

Contact.prototype.update = function(field, info) {
  this[field] = info;

  return info;
}

Contact.prototype.add = function(field, info) {
  var newInfo = new ContactInfoWithType(info);
  this[field + 's'].push(newInfo);

  return newInfo;
}

Contact.prototype.remove = function(field) {
  var removedField = this[field];
  delete this[field];

  return removedField;
}
