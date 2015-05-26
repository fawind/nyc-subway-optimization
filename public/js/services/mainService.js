'use strict';

angular.module('epic-taxi')
  .factory('MainService', ['$http', function($http) {

  function getData() {
    return $http.get('/api/test');
  }

  return {
    getData: getData
  };

}]);
