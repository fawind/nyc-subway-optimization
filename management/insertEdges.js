var qhandler = require('./../app/queries');

qhandler.insertRideEdges()
  .then(function(affectedRows) { console.log('affectedRows:', affectedRows.length); })
  .catch(function(err) { console.log(err); });
