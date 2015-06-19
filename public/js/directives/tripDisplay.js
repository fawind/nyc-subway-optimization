angular.module('epic-taxi')
  .directive("tripDisplay", ['lodash', function(_) {
    // cluster: {'lat' : '123', 'lng': '123'}

    return {
      require: 'leaflet',
      replace: 'false',
      link: function(scope, element, attrs, leafletController) {

        scope.$watch('cluster', function(newCluster, oldCluster) {
          if (!newCluster) return;

          leafletController.getMap()
            .then(function(map) {
              return scope.render(newCluster, map);
            });
        });

        scope.render = function(cluster, map) {
          console.log(map);

          /*
          var overlayPane = d3.select(map.getPanes().overlayPane);

          // remove all old cluster
          overlayPane.selectAll(".cluster").remove();

          var svg = overlayPane.append("svg").attr("class", "leaflet-zoom-hide cluster").attr("width", map._size.x).attr("height", map._size.y);
          var g = svg.append("g");

          var features = cluster.map(function(area) {
            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [area.lat, area.lng]
              },
              properties: { count: area.count }
            };
          });

          _.each(features, function(feature) {
            feature.LatLng = new L.LatLng(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
          });

          var feature = g.selectAll('circle')
            .data(features)
            .enter().append('circle')
            .style("stroke", "black")
            .style("opacity", 0.6)
            .style("fill", "red");

          function update() {
            svg.attr("width", map.getSize().x);
            svg.attr("height", map.getSize().y);
            svg.style("top", function(d) {console.log(map.getBounds());});


            feature.attr("cx", function(d) { return map.latLngToLayerPoint(d.LatLng).x; });
            feature.attr("cy", function(d) { return map.latLngToLayerPoint(d.LatLng).y; });
            //feature.attr("r", function(d) { return d.properties.count / 1400 * Math.pow(2, map._zoom); });
            feature.attr("r", function(d) { return 20 / 1400 * Math.pow(2, map._zoom); });
          }

          map.on("viewreset", update);
          update();

*/
        };

      }
    };
  }]);
