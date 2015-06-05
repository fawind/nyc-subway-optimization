angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

  function getData() {
    return $http.get('/api/test');
  }

  function getStations() {
    return $http.get('/data/subway-lines.json');
  }

  function getCluster(id) {
    var data = { id: id };
    return $http.post('/api/cluster', data);
  }

  function getRouteColor(route) {
    var colors = {
      1: 'red', 2: 'red',
      3: 'red', 4: 'green',
      5: 'green', 6: 'green',
      7: 'purple', A: 'blue',
      B: 'orange', C: 'blue',
      D: 'orange', E: 'blue',
      F: 'orange', G: 'green',
      J: 'brown', L: 'grey',
      M: 'orange', N: 'yellow',
      Q: 'yellow', R: 'yellow',
      Z: 'brown'
    };

    return colors[route];
  }

  return {
    getData: getData,
    getStations: getStations,
    getCluster: getCluster,
    getRouteColor: getRouteColor
  };

}]);

