angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    var markers = {};

    $scope.initMap = function() {
      angular.extend($scope, {
        newYork: {
          lat: 40.7304783951045,
          lng: -73.98880004882812,
          zoom: 12
        },
        tiles: {
          url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          options: {
            attribution: '<a href="http://cartodb.com/attributions">CartoDB</a>'
          }
        }
      });
    };

    $scope.addMarkers = function() {
      angular.extend($scope, {
        markers: angular.copy(markers)
      });
    };

    $scope.initMap();

    mainService.getStations()
      .success(function(routes) {
        console.log('got results...');
        _.each(routes, function(route) {
          _.each(route.stations, function(station, i) {
            var label = '' + route.route + i;
            markers[label] = {
              lat: parseFloat(station.lat),
              lng: parseFloat(station.lng),
              message: station.name,
              focus: false,
              draggable: false
            };
          });
        });
        $scope.addMarkers();
      });


  }]);
