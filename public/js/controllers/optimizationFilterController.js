angular.module('epic-taxi')
  .controller('OptimizationFilterController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    $scope.openOptimizationModal = function() {
      $('#modalOptimization').openModal();
      $('.collapsible').collapsible({});
    };

    $scope.stationDistanceModel = 2000;
    $scope.looseEndsDistanceModel = 1000;
    $scope.relationalComparisonModel = 'true';

    $scope.updatePathfindingFilter = function() {
      var filter = {
        stationDistance: $scope.stationDistanceModel,
        looseEndsDistance: $scope.looseEndsDistanceModel,
      };

      if ($scope.relationalComparisonModel === 'true')
        filter.relational = true;
      else
        filter.relational = false;

      mainService.pathfindingFilter = filter;
    };

    $scope.updatePathfindingFilter();
  }]);
