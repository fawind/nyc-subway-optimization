'use strict';

angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'MainService', function ($scope, mainService) {
    $scope.test = 'Hello Angular';

    // test Service
    mainService.getData()
      .success(function(results) {
        console.log(results);
      });

  }]);
