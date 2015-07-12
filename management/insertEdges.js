var qhandler = require('./../app/queries');

qhandler.getAllClusterSequential(700, false, true)
  .then(function(result) {
    console.log('finished queries. Size:', result.length);
  })
  .catch(function(err) { console.log(err); });
