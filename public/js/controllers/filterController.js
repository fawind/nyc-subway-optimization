angular.module('epic-taxi')
  .controller('FilterController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    var minDate = new Date('2010-01-01');
    var maxDate = new Date('2013-12-31');

    $scope.openModal = function() {
      $('#modalFilter').openModal();

      // Initialize child elements
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

    $scope.updateFilter = function() {
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
    };

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

    function formatDate(date) {
      return date.toISOString().slice(0, 10);
    }

    $scope.updateFilter();
  }]);
