angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

  function getData() {
    return $http.get('/api/test');
  }

  function getStations() {
    return $http.get('/data/subway-lines.json');
  }

  return {
    getData: getData,
    getStations: getStations
  };

}]);
