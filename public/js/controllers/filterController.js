angular.module('epic-taxi')
  .controller('FilterController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    var minDate = new Date('2010-01-01');
    var maxDate = new Date('2013-12-31');

    /* Rides filter */
    $scope.visualizationModel = 'circular';
    $scope.ridesModel = 'incoming';
    $scope.gridSizeModel = 2000;
    $scope.yearModel = {
      year2010: true,
      year2011: true,
      year2012: true,
      year2013: true
    };
    $scope.dateModel = {
      startDate: formatDate(minDate),
      endDate: formatDate(maxDate)
    };

    /* Optimization filter */
    $scope.filterEdgesModel = 'on';
    $scope.countThresholdModel = 1000;
    $scope.distanceThresholdModel = 2200;
    $scope.valueLimitModel = 500;

    /* init the modal */
    $scope.openModal = function() {
      $('#modalFilter').openModal();

      // Initialize child elements
      $('ul.tabs').tabs();
      $('.collapsible').collapsible({});
      $('.datepicker').pickadate({
          container: '#navigation',
          format: "yyyy-mm-dd",
          selectMonths: true,
          closeOnSelect: true,
          selectYears: true,
          onClose: function() {
            var date = this.get();
            var modelName = this.$node.attr('model');

            $scope.dateModel[modelName] = date;
            $scope.updateFilter();
          }
        });
    };

    /* Update filter for subway optimization */
    $scope.updateOptimizationFilter = function() {
      var filter = {};

      if ($scope.filterEdgesModel === 'on')
        filter.filterEdges = true;
      else
        filter.filterEdges = false;

      filter.countThreshold = $scope.countThresholdModel;
      filter.distanceThreshold = $scope.distanceThresholdModel;
      filter.valueLimit = $scope.valueLimitModel;

      mainService.optimizationFilter = filter;
    };

    /* Update filter for clustering rides */
    $scope.updateRidesFilter = function() {
      var startDate = new Date($scope.dateModel.startDate);
      var endDate = new Date($scope.dateModel.endDate);

      var dates = validateDates(startDate, endDate);

      var filter = {
        date: [dates.start, dates.end],
        years: []
      };

      var years = _.each($scope.yearModel, function(checked, year) {
        if (checked === true)
          filter.years.push(year.replace(/\D/g,''));
      });

      mainService.filter = filter;
      mainService.rides = $scope.ridesModel;
      mainService.gridSize = $scope.gridSizeModel;
      mainService.visualization = $scope.visualizationModel;
    };

    /* Check if a given date is in range */
    function validateDates(startDate, endDate) {
      startDate = new Date(startDate);
      endDate = new Date(endDate);

      if (startDate < minDate) {
        startDate = minDate;
        document.getElementById('startDate').value = formatDate(minDate);
      }
      if (endDate > maxDate) {
        endDate = maxDate;
        document.getElementById('endDate').value = formatDate(maxDate);
      }

      return { start: startDate, end: endDate };
    }

    /* Format a given date */
    function formatDate(date) {
      return date.toISOString().slice(0, 10);
    }

    $scope.updateRidesFilter();
    $scope.updateOptimizationFilter();
  }]);
