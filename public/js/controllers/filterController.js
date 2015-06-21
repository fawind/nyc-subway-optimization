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

    $scope.timeModel = {
      morning: true,
      afternoon: true,
      evening: true,
      night: true
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
        years: [],
        time: []
      };

      var years = _.each($scope.yearModel, function(checked, year) {
        if (checked === true)
          filter.years.push(year.replace(/\D/g,''));
      });

      //ToDo: check time format
      var times = _.each($scope.timeModel, function(checked, time) {
        if (checked === true) {
          if (time === 'morning')
            filter.time.push(['0:00', '12:00']);
          if (time === 'afternoon')
            filter.time.push(['12:00', '18:00']);
          if (time === 'evening')
            filter.time.push(['18:00', '22:00']);
          if (time === 'night')
            filter.time.push(['22:00', '24:00']);
        }
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
