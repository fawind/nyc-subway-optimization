angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    var filter = {};
    var optimizationFilter = {};
    var pathfindingFilter = {};
    var rides = '';
    var gridSize;

    var topLeft = {lat: 40.864695, lng: -74.019760};
    var bottomRight = {lat: 40.621053, lng: -73.779058};
    var defaultBox = { topLeft: topLeft, bottomRight: bottomRight };
    var box = null;

    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    function getCluster(id, lat, lng, ridesObj, radius, boundingBox, filterObj) {
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

      if (ridesObj === 'incoming')
        return $http.post('/api/cluster/incoming/raw', data);
      else
        return $http.post('/api/cluster/outgoing', data);
    }

    function getEdges(boundingBox, filterObj) {
      if (boundingBox === null)
        boundingBox = defaultBox;

      return $http.post('/api/analyse', { box: boundingBox, filter: filterObj });
    }

    function findStations(edges, filterObj) {
      return $http.post('/api/analyse/stations', { edges: edges, filter: filterObj });
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
      gridSize: gridSize
    };
  }]);
