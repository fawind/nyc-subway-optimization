var qhandler = require('./../app/queries');

qhandler.getAllClusterSequential(500, false, true)
  .then(function(result) {
    console.log('Finished inserting Edges. Amount of clusters:', result.length);
  })
  .catch(function(err) { console.log(err); });
