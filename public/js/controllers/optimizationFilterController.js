angular.module('epic-taxi')
  .controller('OptimizationFilterController', ['$scope', 'MainService',
    function ($scope, mainService) {

    $scope.newLinesModel = 1;
    $scope.looseEndsDistanceModel = 1000;
    $scope.relationalComparisonModel = 'true';

    /* Init the modal */
    $scope.openOptimizationModal = function() {
      $('#modalOptimization').openModal();
      $('.collapsible').collapsible({});
    };

    /* Update the model */
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
