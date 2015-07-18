angular.module('epic-taxi')
  .factory('MapService', ['lodash', 'leafletEvents', function(_, leafletEvents) {

    var clusterBounds = {
      topLeft: { lat: 40.864695, lng: -74.019760 },
      bottomRight: { lat: 40.621053, lng: -73.779058 }
    };

    var boundsBox = {
      latlngs: [ clusterBounds.topLeft, clusterBounds.bottomRight ],
      type: 'rectangle',
      layer: 'clusterBounds'
    };

    var stationIcon = {
      iconUrl: 'assets/station-marker.png',
      iconSize: [13, 13]
    };

    var newStationIcon = {
      iconUrl: 'assets/station-marker-new.png',
      iconSize: [13, 13]
    };

    var hexbinConfig = {
      radius: 50,
      opacity: 0.7,
      colorRange: ['#FFE0B2', '#E65100']
    };

    /* Return map config */
    function getConfig() {
      return {
        newYork: { lat: 40.7304783951045, lng: -73.98880004882812, zoom: 12 },
        paths: {},
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
            subway: { name: 'Subway', visible: true, type: 'group' },
            optimization: { name: 'Optimization', visible: true, type: 'group' },
            clusterBounds: { name: 'Cluster bounds', visible: false, type: 'group' }
          }
        },
        hexbin: { data: [], config: hexbinConfig },
        events: {
          markers: { enable: [leafletEvents.click, leafletEvents.popupclose] }
        },
        controls: {
          draw: { polyline: false, polygon: false, rectangle: true, circle: false, marker: false }
        },
        defaults: { attributionControl: false }
      };
    }

    /* Return the color of a route */
    function getRouteColor(route) {
      var colors = {
        1: 'red', 2: 'red',
        3: 'red', 4: 'green',
        5: 'green', 6: 'green',
        7: 'purple', A: 'blue',
        B: 'orange', C: 'blue',
        D: 'orange', E: 'blue',
        F: 'orange', G: 'green',
        J: 'brown', L: 'grey',
        M: 'orange', N: 'yellow',
        Q: 'yellow', R: 'yellow',
        Z: 'brown'
      };

      return colors[route] || '#FFC107';
    }

    var iconScale = d3.scale.sqrt()
      .domain([6, 8, 10, 12, 13, 16, 18])
      .range([1, 3, 7, 13, 16, 35, 50]);

    var pathScale = d3.scale.sqrt()
      .domain([9, 12, 14, 16, 18])
      .range([1, 3, 5, 8, 12]);

    /* Create marker object for each station */
    function createMarker(routes) {
      var marker = {};

      _.each(routes, function(route) {
        var layer = 'subway';
        var icon = stationIcon;
        if (route.route.includes('new')) {
          layer = 'optimization';
          icon = newStationIcon;
        }

        _.each(route.stations, function(station, i) {
          marker[station.id] = {
            stationId: station.id,
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng),
            message: station.name,
            focus: false,
            draggable: false,
            icon: icon,
            layer: layer
          };
        });
      });

      return marker;
    }

    /* Create path object for each route */
    function createPaths(routes) {
      var paths = {};

      _.each(routes, function(route) {
        var layer = 'subway';
        if (route.route.includes('new'))
          layer = 'optimization';

        var routePath = {
          color: getRouteColor(route.route),
          weight: 3,
          message: route.route,
          latlngs: [],
          layer: layer
        };

        _.each(route.stations, function(station) {
          routePath.latlngs.push({
            lat: parseFloat(station.lat),
            lng: parseFloat(station.lng)
          });
        });

        paths[route.route] = routePath;
      });

      return paths;
    }

    function sanitizePath(paths) {
      var pathCount = 0;
      var stationCount = 0;
      _.each(paths, function(path) {
        path.route = 'new' + pathCount;

        _.each(path.stations, function(station) {
          station.id = stationCount;
          station.name = 'Station ' + stationCount;
          stationCount++;
        });

        pathCount++;
      });

      return paths;
    }

    /* Check if the given box is valid */
    function validBounds(box) {
      var maxTopLeft = clusterBounds.topLeft;
      var maxBottomRight = clusterBounds.bottomRight;

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

    return {
      getConfig: getConfig,
      createMarker: createMarker,
      createPaths: createPaths,
      clusterBounds: clusterBounds,
      validBounds: validBounds,
      sanitizePath: sanitizePath,
      boundsBox: boundsBox,
      iconScale: iconScale,
      pathScale: pathScale
    };
  }]);

