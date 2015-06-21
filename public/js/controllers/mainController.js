angular.module('epic-taxi')
  .controller('MainController', ['$scope', 'lodash', 'MainService', 'MapService', function ($scope, _, mainService, mapService) {

    initMap = function() {
      var config = mapService.getConfig();
      angular.extend($scope, config);
      $scope.loading = false;

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
        mainService.getCluster(args.model.stationId, args.model.lat, args.model.lng, filter)
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
      _.each($scope.subwayPaths, function(path){
        path.opacity = 0.2;
      });
    };

    showSubway = function() {
      _.each($scope.markers, function(marker){
        marker.opacity = 1.0;
      });
      _.each($scope.subwayPaths, function(path){
        path.opacity = 1.0;
      });
    };

    function updateRoutesAndStationIcons(zoomLevel) {
      _.each($scope.markers, function(marker) {
        marker.icon.iconSize = [iconScale(zoomLevel), iconScale(zoomLevel) ];
      });

      _.each($scope.subwayPaths, function(path) {
        path.weight = pathScale(zoomLevel);
      });
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
        $scope.subwayPaths = mapService.createPaths(routes);
      });
  }]);
