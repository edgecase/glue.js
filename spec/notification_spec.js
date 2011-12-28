// var vows   = require('vows')
// ,   assert = require('assert')
// ,   Glue   = require(__dirname + "/../lib/glue");
// 
// var suite  = vows.describe('notification system');
// 
// suite.addBatch({
//   "any key": {
//     topic: new Glue({}),
// 
//     "notifies listeners of changes assigned to '*' only": function(topic) {
//       glue.target = { arr: [] };
// 
//       var invoke1 = false
//           invoke2 = false;
// 
//       topic.addListener(function() {
//         invoked1 = true;
//       });
// 
//       topic.addListener('arr', function() {
//         invoked2 = true;
//       });
// 
//       topic.addListener('arr#length', function() {
//         invoked2 = true;
//       });
// 
//       topic.addListener('arr[]', function() {
//         invoked2 = true;
//       });
// 
//       topic.notify('*', { oldValue: '', newValue: '' });
//       assert.equal(invoked1, false);
//       assert.equal(invoked2, false);
// 
//       topic.notify('*', { oldValue: '', newValue: 'something' });
//       assert.equal(invoked1, true);
//       assert.equal(invoked2, false);
//     }
//   },
// });
// 
// suite.export(module);
