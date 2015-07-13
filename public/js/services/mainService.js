angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    var filter = {};
    var rides = '';
    var gridSize;

    var topLeft = {lat: 40.864695, lng: -74.019760};
    var bottomRight = {lat: 40.621053, lng: -73.779058};
    var defaultBox = { topLeft: topLeft, bottomRight: bottomRight };
    var box = null;

    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    function getCluster(id, lat, lng, ridesObj, blockSize, boundingBox, filterObj) {
      if (boundingBox === null)
        boundingBox = defaultBox;

      var data = {
        station: {
          id: id,
          lat: lat,
          lng: lng
        },
        blockSize: blockSize,
        box: boundingBox,
        filter: filterObj
      };

      if (ridesObj === 'incoming')
        return $http.post('/api/cluster/incoming', data);
      else
        return $http.post('/api/cluster/outgoing', data);
    }

    function getEdges() {
      return $http.post('/api/analyse', {});
    }

    return {
      getStations: getStations,
      getCluster: getCluster,
      getEdges: getEdges,
      filter: filter,
      rides: rides,
      box: box,
      gridSize: gridSize
    };
  }]);

