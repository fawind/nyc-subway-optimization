angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'lodash', 'MainService', 'MapService', 'PathService', 'leafletData',
    function ($scope, _, mainService, mapService, pathService, leafletData) {

    initMap = function() {
      var config = mapService.getConfig();
      angular.extend($scope, config);
      $scope.loading = false;
      $scope.savedRides = 0;

      addDrawHandler();

      /* Get cluster when clicking on a station */
      $scope.$on('leafletDirectiveMarker.click', function(event, args) {
        clusterStation(args);
      });

      /* Get covered rides when clicking on a line */
      $scope.$on('leafletDirectivePath.click', function(event, args) {
        getCoveredRides(args);
      });

      /* Scale icons based on zoom level */
      $scope.$on('leafletDirectiveMap.zoomend', function(event, args) {
        var zoomLevel = args.leafletEvent.target.getZoom();
        updateRoutesAndStationIcons(zoomLevel);
      });
    };

    /* Get cluster when clicking on a station */
    function clusterStation(args) {
      $scope.loading = true;
      hideSubway(args.model.stationId);

      /* Load the models */
      var visualization = mainService.visualization;
      var filter = mainService.filter;
      var rides = mainService.rides;
      var gridSize = mainService.gridSize;
      var boundingBox = mainService.box;

      mainService.getCluster(args.model.stationId, args.model.lat, args.model.lng, rides, gridSize, boundingBox, filter, visualization)
        .success(function(response) {
          // Hexbin visualization or circular visualization
          if (visualization === 'hexbin')
            $scope.hexbin.data = response.points.map(function(point) { return [ point.lng, point.lat ]; });
          else {
            // get the top 5 cluster
            $scope.cluster = {
              station: { id: args.model.stationId, lat: args.model.lat, lng: args.model.lng },
              gridSize: gridSize,
              cluster: _.sortBy(response.cluster, 'count').reverse().slice(0, 5)
            };
          }

          $scope.loading = false;
        })
        .error(function(error) {
          $scope.loading = false;
          console.error('[ERROR]', error.error);
          Materialize.toast('Error retrieving results!', 2000);
        });
    }

    /* Reset the view */
    $scope.resetStation = function() {
      showSubway();

      $scope.paths = _.pick($scope.paths, function(path) {
        return path.layer === 'subway';
      });

      $scope.markers = _.pick($scope.markers, function(marker) {
        return marker.layer === 'subway';
      });

      $scope.savedRides = null;
      $scope.lineRides = null;
      $scope.cluster = {};
      $scope.edges = [];
      $scope.hexbin.data = [];
    };

    /* Get clustered edges */
    $scope.optimizeRoutes = function() {
      $scope.loading = true;
      hideSubway();

      var filter = mainService.optimizationFilter;
      var boundingBox = mainService.box;

      mainService.getEdges(boundingBox, filter)
        .success(function(edges) {
          angular.extend($scope, { edges: angular.copy(edges.edges) });
          $scope.loading = false;
        })
        .error(function(error) {
          $scope.loading = false;
          console.error('[ERROR]', error.error);
          Materialize.toast('Error retrieving results!', 2000);
        });
    };

    /* Get new stations based on given edges */
    $scope.findStations = function() {
      $('#modalOptimization').closeModal();
      $scope.loading = true;

      var filter = mainService.pathfindingFilter;
      var edges = $scope.edges;

      mainService.findStations(edges, filter)
        .success(function(results) {
          $scope.edges = [];
          $scope.loading = false;

          $scope.savedRides = 0;
          _.each(results, function(route) {
            $scope.savedRides += route.counts;
            route.stations = pathService.antiAliasePath(route.stations);
          });

          results = mapService.sanitizePath(results);
          var routes = mapService.createPaths(results);
          var stations = mapService.createMarker(results);

          $scope.results = results;
          $scope.paths = _.assign($scope.paths, routes);
          $scope.markers = _.assign($scope.markers, stations);
        })
        .error(function(error) {
          $scope.loading = false;
          console.error('[ERROR]', error.error);
          Materialize.toast('Error retrieving results!', 2000);
        });
    };

    /* Draw a new bounding box on the map */
    function addDrawHandler() {
      var currentBoundingBoxLayer = null;
      leafletData.getMap('map').then(function(map) {
        var drawnItems = $scope.controls.edit.featureGroup;
        map.on('draw:created', function(e) {
          drawnItems.removeLayer(currentBoundingBoxLayer);
          var layer = e.layer;
          currentBoundingBoxLayer = layer;

          var form = layer.toGeoJSON().geometry.coordinates[0];
          var topLeft = { lat: form[1][1], lng: form[1][0] };
          var bottomRight = { lat: form[3][1], lng: form[3][0] };
          var box = { topLeft: topLeft, bottomRight: bottomRight };

          if (mapService.validBounds(box)) {
            drawnItems.addLayer(layer);
            mainService.box = box;
          }
          else
            Materialize.toast('The bounding box is to big!', 2000);
        });

        map.on('draw:deleted', function(e) {
          mainService.box = null;
        });
      });
    }

    /* Get the number of rides covered by a subway line */
    function getCoveredRides(args) {
      var lineName = args.modelName;

      var lines = $scope.routes;
      if ($scope.results)
        lines = lines.concat($scope.results);

      var line = _.find(lines, function(line) { return line.route === lineName; });

      mainService.getRidesCount(line.stations)
        .success(function(results) {
          $scope.lineRides = results.count;
        });
    }

    /* Decrease the subway-routes opacity except a given station */
    function hideSubway(id) {
      _.each($scope.markers, function(marker){
        if (id === marker.stationId)
          marker.opacity = 1.0;
        else
          marker.opacity = 0.2;
      });

      _.each($scope.paths, function(path){
        path.opacity = 0.2;
      });
    }

    /* Reset the subway-routes opacity */
    function showSubway() {
      _.each($scope.markers, function(marker){
        marker.opacity = 1.0;
      });

      _.each($scope.paths, function(path){
        path.opacity = 1.0;
      });
    }

    /* Scale all icons to a given zoom level */
    function updateRoutesAndStationIcons(zoomLevel) {
      _.each($scope.markers, function(marker) {
        marker.icon.iconSize = [ mapService.iconScale(zoomLevel), mapService.iconScale(zoomLevel) ];
      });

      _.each($scope.paths, function(path) {
        path.weight = mapService.pathScale(zoomLevel);
      });
    }

    /* Init the Map and load the subway routes */
    initMap();
    mainService.getStations()
      .success(function(routes) {
        $scope.routes = routes;
        $scope.markers = mapService.createMarker(routes);
        $scope.paths = mapService.createPaths(routes);
        $scope.paths.cluster = mapService.boundsBox;
      });
  }]);
