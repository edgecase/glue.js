// var vows = require('vows')
// ,   _ = require('underscore')
// ,   assert = require('assert')
// ,   Glue   = require(__dirname + "/../lib/glue")
// 
// ,   suite = vows.describe('current spec');
// 
// suite.addBatch({
//   "all": {
//     topic: new Glue({v1: ''}),
// 
//     "notifies all listeners assigned to any key (*)": function(glue) {
//       var glue = new Glue({v1: 1}),
//           message1 = {},
//           message2 = {};
// 
//       glue.resetListeners();
// 
//       glue.addListener(function(msg) {
//         message1 = msg;
//       });
// 
//       glue.addListener(function(msg) {
//         message2 = msg;
//       });
// 
//       glue.set('v1', 2);
// 
//       assert.deepEqual(message1, {
//         operation: 'set',
//         value: {v1: 2}
//       });
// 
//       assert.deepEqual(message2, {
//         operation: 'set',
//         value: {v1: 2}
//       });
//     },
//   }
// });
// 
// suite.export(module)
