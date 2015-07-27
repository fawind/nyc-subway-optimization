angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    /* Models */
    var filter = {};
    var optimizationFilter = {};
    var pathfindingFilter = {};
    var rides;
    var gridSize;
    var visualization;

    var topLeft = {lat: 40.864695, lng: -74.019760};
    var bottomRight = {lat: 40.621053, lng: -73.779058};
    var defaultBox = { topLeft: topLeft, bottomRight: bottomRight };
    var box = null;

    /* Load the subway network */
    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    /* Get the cluster for a given station */
    function getCluster(id, lat, lng, ridesObj, radius, boundingBox, filterObj, visualization) {
      if (boundingBox === null)
        boundingBox = defaultBox;

      var data = {
        station: {
          id: id,
          lat: lat,
          lng: lng
        },
        radius: radius,
        box: boundingBox,
        filter: filterObj
      };

      if (ridesObj === 'incoming') {
        if (visualization === 'hexbin')
          return $http.post('/api/cluster/incoming/raw', data);
        else
          return $http.post('/api/cluster/incoming', data);
      }
      else {
        if (visualization === 'hexbin')
          return $http.post('/api/cluster/outgoing/raw', data);
        else
          return $http.post('/api/cluster/outgoing', data);
      }
    }

    /* Get all edges */
    function getEdges(boundingBox, filterObj) {
      if (boundingBox === null)
        boundingBox = defaultBox;

      return $http.post('/api/analyse', { box: boundingBox, filter: filterObj });
    }

    /* Get all stations based on given edges */
    function findStations(edges, filterObj) {
      var retStations = $http.post('/api/analyse/stations', { edges: edges, filter: filterObj });

      /* smoothen line for frontend representation */
      for (n = 0; n < retStations.length; n++) {
        retStations[n].stations = antiAliasePath(retStations[n].stations);
      }

      return retStations;
    }

    return {
      getStations: getStations,
      getCluster: getCluster,
      getEdges: getEdges,
      findStations: findStations,
      filter: filter,
      optimizationFilter: optimizationFilter,
      pathfindingFilter: pathfindingFilter,
      rides: rides,
      box: box,
      gridSize: gridSize,
      visualization: visualization
    };
  }]);
