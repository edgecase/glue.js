var vows = require('vows'),
    assert = require('assert');

var glue = require("./lib/glue.js");

var suite = vows.describe('glue.js');

suite.addBatch({
  "an ObjectController": {
    "with no arguments":{
      topic: function(){
        return new ObjectController();
      },
      "is valid without an argument":function(topic){
        assert.isNotNull(topic);
        assert.isNotNull(topic.addObserver);
        assert.isNotNull(topic.removeObserver);
        assert.isNotNull(topic.bindTo);
        assert.isNotNull(topic.broadcast);
        assert.isNotNull(topic.get);
        assert.isNotNull(topic.set);
      }
    },
    "with one argument":{
      topic: function(){
        return new ObjectController({"name":"Leon"});
      },
      "is valid with an object":function(topic){
        assert.isNotNull(topic);
        assert.isNotNull(topic.addObserver);
        assert.isNotNull(topic.removeObserver);
        assert.isNotNull(topic.bindTo);
        assert.isNotNull(topic.broadcast);
        assert.equal(topic.get("name"), "Leon");
        assert.equal(topic.set("name", "Felix"), "Felix");
        assert.equal(topic.get("name"), "Felix");
        assert.equal(topic.set("name", "Leon"), "Leon");
      }
    }
  }
});
