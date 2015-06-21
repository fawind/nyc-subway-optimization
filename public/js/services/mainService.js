angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    var filter = {};

    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    function getCluster(id, lat, lng, filterObj) {
      var data = {
        id: id,
        lat: lat,
        lng: lng,
        filter: filterObj
      };
      return $http.post('/api/cluster', data);
    }

    return {
      getStations: getStations,
      getCluster: getCluster,
      filter: filter
    };
  }]);

