angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'MainService', function ($scope, mainService) {
    $scope.test = 'Hello Angular';
    console.log('Controller running');

    // test Service
    mainService.getData()
      .success(function(results) {
        console.log(results);
      });

    angular.extend($scope, {
      newYork: {
        lat: 40.7304783951045,
        lng: -73.98880004882812,
        zoom: 13
      },
      tiles: {
        url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        options: {
          attribution: '<a href="http://cartodb.com/attributions">CartoDB</a>'
        }
      }
    });

  }]);
