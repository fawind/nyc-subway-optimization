angular.module('epic-taxi')
  .factory('MapService', ['lodash', 'leafletEvents', function(_, leafletEvents) {

    var stationIcon = {
      iconUrl: 'assets/station-marker2.png',
      iconSize: [13, 13]
    };

    /* Return map config */
    function getConfig() {
      return {
        newYork: { lat: 40.7304783951045, lng: -73.98880004882812, zoom: 12 },
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
            subway: { name: 'Subway', visible: true, type: 'group' }
          }
        },
        events: {
          markers: { enable: [leafletEvents.click, leafletEvents.popupclose] }
        }
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

      return colors[route];
    }

    /* Create marker object for each station */
    function createMarker(routes) {
      var marker = {};

      _.each(routes, function(route) {
        _.each(route.stations, function(station, i) {
          marker[station.id] = {
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

      return marker;
    }

    /* Create path object for each route */
    function createPaths(routes) {
      var paths = {};

      _.each(routes, function(route) {
        var routePath = {
          color: getRouteColor(route.route),
          weight: 3,
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

      return paths;
    }

    return {
      getConfig: getConfig,
      createMarker: createMarker,
      createPaths: createPaths
    };
  }]);

