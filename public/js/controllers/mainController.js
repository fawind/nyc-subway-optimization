angular.module('epic-taxi')
.controller('MainController', ['$scope', 'lodash', 'MainService', 'leafletEvents', function ($scope, _, mainService, leafletEvents) {

  var markers = {};
  var paths = {};
  var stationIcon = {
    iconUrl: 'assets/station-marker.png',
    iconSize: [25, 25]
  };

  $scope.initMap = function() {
    angular.extend($scope, {
      newYork: {
        lat: 40.7304783951045,
        lng: -73.98880004882812,
        zoom: 12
      },
      subwayPaths: {},
      layers: {
        baselayers: {
          mapbox_light: {
            name: 'Light',
            type: 'xyz',
            url: 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
          },
          mapbox_dark: {
            name: 'Dark',
            type: 'xyz',
            url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          }
        },
        overlays: {
          subway: {
            name: 'Subway',
            visible: true,
            type: 'group',
          }
        }
      },
      events: {
        markers: {
          enable: [leafletEvents.click, leafletEvents.popupclose]
        }
      },
      defaults: {
        layerControl: true
      }
    });

    $scope.$on('leafletDirectiveMarker.click', function(event, args) {
      $scope.hideSubway(args.model.stationId);
      mainService.getCluster(args.model.stationId)
      .success(function(response) {
        console.log(response);
      });
    });

    $scope.$on('leafletDirectiveMarker.popupclose', function(event, args) {
      $scope.showSubway();
    });
  };

  $scope.hideSubway = function(id) {
    _.each($scope.markers, function(marker){
      if (id !== marker.stationId)
        marker.opacity = 0.2;
    });
    _.each($scope.subwayPaths, function(path){
      path.opacity = 0.2;
    });
  };

  $scope.showSubway = function() {
    _.each($scope.markers, function(marker){
      marker.opacity = 1.0;
    });
    _.each($scope.subwayPaths, function(path){
      path.opacity = 1.0;
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
        markers[station.id] = {
          stationId: station.id,
          lat: parseFloat(station.lat),
          lng: parseFloat(station.lng),
          message: station.name,
          focus: false,
          draggable: false,
          icon: stationIcon,
          layer: 'subway'
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
        latlngs: [],
        layer: 'subway'
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



  function updateRoutesAndStationIcons(zoomLevel) {

    for (i = 0; i < Object.keys(paths).length; ++i) {
      if (typeof paths[i] != 'undefined'){
        paths[i].weight = zoomLevel;
      };
    };

  var newStationIcon = {    //größen nur zum testen
    iconUrl: 'assets/station-marker.png',
    iconSize: [zoomLevel*3, zoomLevel*3]
  };

  for (i = 0; i < Object.keys(markers).length; ++i) {
    if (typeof markers[i] != 'undefined'){
      markers[i].icon = newStationIcon;
    };
  };
    /*    _.each($scope.markers, function(marker){
          marker.icon = newStationIcon;
      });
    */ //funktioniert irgendwie nicht

    $scope.addMarkers();
    $scope.addPaths();

};


$scope.initMap();

mainService.getStations()
.success(function(routes) {
  console.log('Got all stations...');
  addRoutes(routes);
  addStations(routes);
});


$scope.$on('leafletDirectiveMap.zoomstart', function(){
  updateRoutesAndStationIcons(2);
});


}]);
