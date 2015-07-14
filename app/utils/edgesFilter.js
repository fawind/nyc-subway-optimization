var _ = require('lodash');

var geo = require('./geo');

var edgesFilter = {
  filterExpression: function(edge, distance_threshold) {
    var distance = geo.getDistance_m(edge.lat_in, edge.lng_in,
          edge.lat_out, edge.lng_out) <= distance_threshold;

    return distance;
  },

  filter: function(edges, distance) {
    return _.filter(edges, function(edge) {
      return edgesFilter.filterExpression(edge, distance);
    });
  }
};

module.exports = edgesFilter;
