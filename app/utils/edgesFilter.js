var _ = require('lodash');

var COUNT_THRESHOLD = 100;

var edgesFilter = {
  filterCount: function(edges) {
    var filtered = _.filter(edges, function(edge) {
        return edge.counts >= COUNT_THRESHOLD;
      });
    return filtered;
  }
};

module.exports = edgesFilter;
