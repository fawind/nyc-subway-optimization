var EdgeCalculator = require('./../app/edgecalculator');

EdgeCalculator.getAllClusterSequential(500, true, true)
  .then(function(result) {
    console.log('Finished inserting Edges. Amount of clusters:', result.length);
  })
  .catch(function(err) { console.log(err); });
