angular.module('epic-taxi')
  .directive("cluster", ['lodash', function(_) {
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

          // Add a circle for each feature
          var feature = g.selectAll('circle')
            .data(features)
            .enter().append('circle')
            .style("stroke", "black")
            .style("opacity", 0.6)
            .style("fill", "red");

          map.on("viewreset", update);
          update();

          /* Update size and scaling of svgs on mapchange */
          function update() {
            var bounds = getBounds(features);
            var radius = 20 / 1400 * Math.pow(2, map.getZoom());

            var width = Math.abs((bounds.max[0] - bounds.min[0]) + 2 * radius);
            var height = Math.abs((bounds.max[1] - bounds.min[1]) + 2 * radius);
            var left = bounds.min[0] - radius;
            var top = bounds.min[1] - radius;

            svg.attr('width', width).attr('height', height)
              .style("left", left + 'px')
              .style("top", top + 'px');

            g .attr("transform", "translate(" + -bounds.min[0] + "," + -bounds.min[1] + ")");

            g.selectAll('circle')
              .attr("cx", function(d) { return map.latLngToLayerPoint(d.LatLng).x + radius; })
              .attr("cy", function(d) { return map.latLngToLayerPoint(d.LatLng).y + radius;})
              .attr("r", radius);
          }

          /* Get the min and max bounds of all features */
          function getBounds(features) {
            var bounds = { min: [999, 999], max: [-999, -999] };

            _.each(features, function(element) {
              var point = map.latLngToLayerPoint(element.LatLng);

              bounds.min[0] = Math.min(bounds.min[0], point.x);
              bounds.min[1] = Math.min(bounds.min[1], point.y);
              bounds.max[0] = Math.max(bounds.max[0], point.x);
              bounds.max[1] = Math.max(bounds.max[1], point.y);
            });

            return bounds;
          }
        };
      }
    };
  }]);
