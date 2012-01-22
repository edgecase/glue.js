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
//       var message  = {};
// 
//       glue.target = {v1: 1};
//       glue.resetListeners();
// 
//       glue.addListener('v1', function(msg) {
//         message = msg;
//       });
// 
//       glue.set('v1', 2);
// 
//       assert.deepEqual(message, {
//         operation: 'set',
//         oldValue: 1,
//         currentValue: 2
//       });
//     }
//   },
// });
// 
// suite.export(module)
