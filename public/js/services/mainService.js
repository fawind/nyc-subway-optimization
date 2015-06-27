angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    var filter = {};
    var rides = '';
    var gridSize = 2000;

    var topLeft = {lat: 40.864695, lng: -74.019760};
    var bottomRight = {lat: 40.621053, lng: -73.779058};
    var box = { topLeft: topLeft, bottomRight: bottomRight };

    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    function getCluster(id, lat, lng, ridesObj, blockSize, filterObj) {
      var data = {
        station: {
          id: id,
          lat: lat,
          lng: lng
        },
        blockSize: blockSize,
        box: box,
        filter: filterObj
      };

      if (ridesObj === 'incoming')
        return $http.post('/api/cluster/incoming', data);
      else
        return $http.post('/api/cluster/outgoing', data);
    }

    return {
      getStations: getStations,
      getCluster: getCluster,
      filter: filter,
      rides: rides,
      box: box,
      gridSize: gridSize
    };
  }]);

