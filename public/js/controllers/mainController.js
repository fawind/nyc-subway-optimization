angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'lodash', 'MainService', 'MapService', 'leafletData', function ($scope, _, mainService, mapService, leafletData) {

    var currentBoundingBoxLayer = null;

    initMap = function() {
      var config = mapService.getConfig();
      angular.extend($scope, config);
      $scope.loading = false;

      leafletData.getMap('map').then(function(map) {
        var drawnItems = $scope.controls.edit.featureGroup;
        map.on('draw:created', function(e) {
          drawnItems.removeLayer(currentBoundingBoxLayer);
          var layer = e.layer;
          currentBoundingBoxLayer = layer;

          var form = layer.toGeoJSON().geometry.coordinates[0];
          console.log(layer.toGeoJSON());
          var topLeft = { lat: form[1][1], lng: form[1][0] };
          var bottomRight = { lat: form[3][1], lng: form[3][0] };
          var box = { topLeft: topLeft, bottomRight: bottomRight };

          console.log(box);

          if (validBounds(box)) {
            drawnItems.addLayer(layer);
            mainService.box = box;
          }
          else {
            Materialize.toast('The bounding box is to big!', 2000);
          }
        });

        map.on('draw:deleted', function(e) {
          mainService.box = null;
       });
      });

      $scope.$on('leafletDirectiveMarker.click', function(event, args) {
        $scope.loading = true;
        hideSubway(args.model.stationId);

        // sample cluster
        /*
        var cluster = [{"count":135339,"lat":40.795053,"lng":-73.92376},{"count":61505,"lat":40.795053,"lng":-73.96276},{"count":48905,"lat":40.831053,"lng":-73.92376},{"count":37458,"lat":40.759053,"lng":-73.96276},{"count":14742,"lat":40.759053,"lng":-74.00176}];
        var clusterObj = {
          station: {
            id: args.model.stationId,
            lat: args.model.lat,
            lng: args.model.lng
          },
          cluster: cluster
        };
        angular.extend($scope, {
          cluster: angular.copy(clusterObj)
        });
        */

        var filter = mainService.filter;
        var rides = mainService.rides;
        var gridSize = mainService.gridSize;
        var boundingBox = mainService.box;
        mainService.getCluster(args.model.stationId, args.model.lat, args.model.lng, rides, gridSize, boundingBox, filter)
          .success(function(response) {
            // get the top 5 cluster
            var cluster = {
              station: {
                id: args.model.stationId,
                lat: args.model.lat,
                lng: args.model.lng
              },
              cluster: _.sortBy(response.cluster, 'count').reverse().slice(0, 5)
            };

            angular.extend($scope, {
              cluster: angular.copy(cluster),
              loading: false
            });
          });
      });

      $scope.$on('leafletDirectiveMap.zoomend', function(event, args) {
        var zoomLevel = args.leafletEvent.target.getZoom();
        updateRoutesAndStationIcons(zoomLevel);
      });
    };

    // Dismiss cluster view
    $scope.resetStation = function() {
      showSubway();
      angular.extend($scope, {
        cluster: angular.copy({})
      });
    };

    hideSubway = function(id) {
      _.each($scope.markers, function(marker){
        if (id === marker.stationId)
          marker.opacity = 1.0;
        else
          marker.opacity = 0.2;
      });
      _.each($scope.paths, function(path){
        path.opacity = 0.2;
      });
    };

    showSubway = function() {
      _.each($scope.markers, function(marker){
        marker.opacity = 1.0;
      });
      _.each($scope.paths, function(path){
        path.opacity = 1.0;
      });
    };

    function updateRoutesAndStationIcons(zoomLevel) {
      _.each($scope.markers, function(marker) {
        marker.icon.iconSize = [iconScale(zoomLevel), iconScale(zoomLevel) ];
      });

      _.each($scope.paths, function(path) {
        path.weight = pathScale(zoomLevel);
      });
    }

    function validBounds(box) {
      var maxTopLeft = mapService.clusterBounds.topLeft;
      var maxBottomRight = mapService.clusterBounds.bottomRight;

      function inArea(point) {
        if ((point.lat <= maxTopLeft.lat && point.lat >= maxBottomRight.lat) &&
        (point.lng >= maxTopLeft.lng && point.lng <= maxBottomRight.lng)) {
          return true;
        }
        return false;
      }

      if (inArea(box.topLeft) && inArea(box.bottomRight)) {
        return true;
      }
      return false;
    }

    var iconScale = d3.scale.sqrt()
      .domain([6, 8, 10, 12, 13, 16, 18])
      .range([1, 3, 7, 13, 16, 35, 50]);

    var pathScale = d3.scale.sqrt()
      .domain([9, 12, 14, 16, 18])
      .range([1, 3, 5, 8, 12]);

    // init the Map and load the subway routes
    initMap();

    mainService.getStations()
      .success(function(routes) {
        console.log('Got all stations...');

        $scope.markers = mapService.createMarker(routes);
        $scope.paths = mapService.createPaths(routes);
      });
  }]);
