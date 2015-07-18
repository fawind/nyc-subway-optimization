var clientPool = require('./hana');
var geo = require('./utils/geo');

function maxCounts(edges, relational) {
  var max = edges[0],
      coefM = relational ? edgeLength(max) : 1;

  for (i = 0; i < edges.length; i++) {
    var coefC = relational ? edgeLength(edges[i]) : 1;

    if ((edges[i].counts / coefC) > (max.counts / coefM) && !edges[i].visited) {
      coefM = coefC;
      max = edges[i];
    }
  }
  return max;
}

function edgeLength(edge) {
  return geo.getDistance_m(edge.lat_in, edge.lng_in, edge.lat_out, edge.lng_out);
}

var PathFinder = {
  findBestLine: function(edges, looseDistance, stationDistance, relational, cb) {
    var paths = [];
    // catch possible errors
    if (edges.length == 0) {
      console.log('No edges given');
      cb(paths);
    }

    var start = maxCounts(edges);
    start.visited = true;
    // for the extracted maximum edge try to generate an optimal line
    cb(paths);
  }
}

module.exports = PathFinder;
