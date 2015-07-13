var _ = require('lodash');

var geo = require('./geo');

var COUNT_THRESHOLD = 100;
var DISTANCE_THRESHOLD = 3000;

var edgesFilter = {
  filterExpression: function(edge) {
    var count = edge.counts >= COUNT_THRESHOLD;
    var distance = geo.getDistance_m(edge.lat_in, edge.lng_in,
          edge.lat_out, edge.lng_out) <= DISTANCE_THRESHOLD;

    return count && distance;
  },

  filter: function(edges) {
    return _.filter(edges, function(edge) {
      return edgesFilter.filterExpression(edge);
    });
  }
};

module.exports = edgesFilter;
