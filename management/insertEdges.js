var EdgeCalculator = require('./../app/edgecalculator');

const radius = 500;
const exportTmp = true;
const insertDB = true;
const box = {topLeft: { lat: 40.864695, lng: -74.01976 }, bottomRight: { lat: 40.621053, lng: -73.779058 }};
const dates = [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ];
const years = [ '2010', '2011', '2012', '2013' ];

EdgeCalculator.getAllClusterSequential(radius, exportTmp, insertDB, box, dates, years)
  .then(function(clusters) {
    console.log('Finished inserting Edges. Amount of clusters:', clusters);
  })
  .catch(function(err) { console.log(err); });
