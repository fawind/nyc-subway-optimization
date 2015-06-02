angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'lodash', 'MainService', function ($scope, _, mainService) {

    var markers = {};
    var paths = {};
    var stationIcon = {
      iconUrl: 'assets/station-marker.png',
      iconSize:     [20, 20]
    };

    $scope.initMap = function() {
      angular.extend($scope, {
        newYork: {
          lat: 40.7304783951045,
          lng: -73.98880004882812,
          zoom: 12
        },
        subwayPaths: {},
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

    $scope.addPaths = function() {
      angular.extend($scope, {
        subwayPaths: angular.copy(paths)
      });
    };

    function addStations(routes) {
      _.each(routes, function(route) {
        _.each(route.stations, function(station, i) {
          var label = '' + route.route + i;
          markers[label] = {
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng),
            message: station.name,
            focus: false,
            draggable: false,
            icon: stationIcon
          };
        });
      });
      $scope.addMarkers();
    }

    function addRoutes(routes) {
      _.each(routes, function(route) {
        var routePath = {
          color: mainService.getRouteColor(route.route),
          weight: 5,
          message: route.route,
          latlngs: []
        };

        _.each(route.stations, function(station) {
          routePath.latlngs.push({
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng)
          });
        });

        paths[route.route] = routePath;
      });
      $scope.addPaths();
    }

    $scope.initMap();

    mainService.getStations()
      .success(function(routes) {
        console.log('Got all stations...');
        addRoutes(routes);
        addStations(routes);
      });


  }]);
