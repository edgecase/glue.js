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
//     "notifies listener of that key": function(topic) {
//       var message;
// 
//       topic.target = { arr: [] };
// 
//       topic.addListener('arr', function(msg) {
//         message = msg;
//       });
// 
//       topic.push('arr', 2);
// 
//       assert.deepEqual(message, {
//         operation: "push",
//         newValue: 2
//       });
//     }
//   }
// });
// 
// suite.export(module)
