// var vows = require('vows')
// ,   assert = require('assert')
// ,   Glue   = require(__dirname + "/../lib/glue")
// 
// ,   suite = vows.describe('current spec');
// 
// suite.addBatch({
//   "current test": {
//     topic: new Glue ({ v1: { arr: [ { v2: '' } ]}}),
// 
//     "notifies listeners that the value has been removed": function(topic) {
//       var message;
// 
//       topic.target = {v1: 'value'};
// 
//       topic.addListener('v1', function(msg) {
//         message = msg;
//       });
// 
//       topic.remove('v1');
// 
//       assert.deepEqual(message, { operation: 'remove', oldValue: 'value' });
//     }
//   }
// });
// 
// suite.export(module)
