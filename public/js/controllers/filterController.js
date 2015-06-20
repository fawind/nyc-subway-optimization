angular.module('epic-taxi')
  .controller('FilterController', ['$scope', '$timeout', function ($scope, $timeout) {

    $scope.openModal = function() {
      $('#modalFilter').openModal();

      // Initialize child elements
      $('.collapsible').collapsible({});
      $('.datepicker').pickadate({
          container: '#navigation',
          selectMonths: true,
          closeOnSelect: true,
          min: [2010, 1, 1],
          max: [2013, 12, 31],
          selectYears: 5
        });
    };

  }]);
