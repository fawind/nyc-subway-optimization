var clientPool = require('./hana');
var geo = require('./utils/geo');

function maxCounts(edges) {
  var len = edges.length;
  var max = edges[0];
  while (len--) {
    if (edges[len].counts > max.counts &&
        !edges[len].visited) {
      max = edges[len];
    }
  }
  return max;
};

var PathFinder = {
  findBestLine: function(edges, looseDistance, stationDistance) {
    if (edges.length == 0) {
      return;
    }
    var start = maxCounts(edges);
    start.visited = true;
  }
}

module.exports = PathFinder;
