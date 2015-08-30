angular.module('epic-taxi')
  .directive('cluster', ['lodash', function(_) {
    return {
      require: 'leaflet',
      replace: 'false',
      link: function(scope, element, attrs, leafletController) {

        scope.$watch('cluster', function(newCluster, oldCluster) {
          if (!newCluster) return;

          leafletController.getMap()
            .then(function(map) {
              return render(newCluster, map);
            });
        });

        /* Update the cluster connections view */
        function render(cluster, map) {
          if (cluster.cluster === undefined)
            removeConnection(map);
          else
            renderConnections(cluster, map);
        }

        /* Remove all rendered cluster connections */
        function removeConnection(map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);
          overlayPane.selectAll('.clusterConnection').remove();
        }

        /* Draw connections for all given cluster on the map */
        function renderConnections(cluster, map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);
          removeConnection(map);

          var svg = overlayPane.append('svg').attr('class', 'leaflet-zoom-hide clusterConnection');
          var g = svg.append('g');

          /* Each line connects the station with the center of the cluster circles */
          var connections = cluster.cluster.map(function(area) {
            return [
                { x: cluster.station.lat, y: cluster.station.lng },
                { x: area.lat, y: area.lng }
              ];
          });

          var line = d3.svg.line()
            .x(function(d) { return map.latLngToLayerPoint(new L.LatLng(d.x, d.y)).x; })
            .y(function(d) { return map.latLngToLayerPoint(new L.LatLng(d.x, d.y)).y; })
            .interpolate('cardinal');

          var feature = g.selectAll('path')
            .data(connections)
            .enter().append('path')
            .attr('class', 'line')
            .attr('d', line)
            .attr('stroke', '#B71C1C')
            .attr('stroke-width', 4)
            .style('opacity', 0.6)
            .style('stroke-dasharray', ('10,3'));

          map.on('viewreset', update);
          update();

          /* Update size and scaling of svgs on mapchange */
          function update() {
            var bounds = getBounds(connections);

            var width = Math.abs(bounds.max[0] - bounds.min[0]);
            var height = Math.abs(bounds.max[1] - bounds.min[1]);
            var left = bounds.min[0];
            var top = bounds.min[1];

            svg.attr('width', width).attr('height', height)
              .style('left', left + 'px')
              .style('top', top + 'px');

            g.attr('transform', 'translate(' + -bounds.min[0] + ',' + -bounds.min[1] + ')');

            feature.attr('d', line);
          }

          /* Get the min and max bounds of all connections */
          function getBounds(feature) {
            var bounds = { min: [999, 999], max: [-999, -999] };

            _.each(feature, function(path) {
              _.each(path, function(point) {
                point = map.latLngToLayerPoint(new L.LatLng(point.x, point.y));

                bounds.min[0] = Math.min(bounds.min[0], point.x);
                bounds.min[1] = Math.min(bounds.min[1], point.y);
                bounds.max[0] = Math.max(bounds.max[0], point.x);
                bounds.max[1] = Math.max(bounds.max[1], point.y);
              });
            });

            return bounds;
          }
        }
      }
    };
  }]);
