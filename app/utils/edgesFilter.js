var _ = require('lodash');

var geo = require('./geo');

var COUNT_THRESHOLD = 1000;
var DISTANCE_THRESHOLD = 2200;
var AMOUNT_OF_VALUES = 500;

var edgesFilter = {
  count_threshold: COUNT_THRESHOLD,
  amount_of_values: AMOUNT_OF_VALUES,
  filterExpression: function(edge) {
    var distance = geo.getDistance_m(edge.lat_in, edge.lng_in,
          edge.lat_out, edge.lng_out) <= DISTANCE_THRESHOLD;

    return distance;
  },

  filter: function(edges) {
    return _.filter(edges, function(edge) {
      return edgesFilter.filterExpression(edge);
    });
  }
};

module.exports = edgesFilter;
