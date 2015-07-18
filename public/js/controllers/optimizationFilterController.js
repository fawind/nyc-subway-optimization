angular.module('epic-taxi')
  .controller('OptimizationFilterController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    $scope.openOptimizationModal = function() {
      $('#modalOptimization').openModal();
      $('.collapsible').collapsible({});
    };

    $scope.newLinesModel = 1;
    $scope.looseEndsDistanceModel = 1000;
    $scope.relationalComparisonModel = 'true';

    $scope.updatePathfindingFilter = function() {
      var filter = {
        newLines: $scope.newLinesModel,
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
