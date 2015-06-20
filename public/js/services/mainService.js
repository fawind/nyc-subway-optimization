angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

    function getStations() {
      return $http.get('/data/subway-lines.json');
    }

    function getCluster(id, lat, lng) {
      var data = { id: id, lat: lat, lng: lng };
      return $http.post('/api/cluster', data);
    }

    return {
      getStations: getStations,
      getCluster: getCluster
    };

  }]);

