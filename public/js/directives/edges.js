angular.module('epic-taxi')
  .directive('edges', ['lodash', function(_) {
    return {
      require: 'leaflet',
      replace: 'false',
      link: function(scope, element, attrs, leafletController) {

        scope.$watch('edges', function(newEdges, oldEdges) {
          if (!newEdges) return;

          leafletController.getMap()
            .then(function(map) {
              return render(newEdges, map);
            });
        });

        function render(edges, map) {
          if (edges === undefined || edges.length === 0)
            removeEdges(map);
          else
            renderEdges(edges, map);
        }

        function removeEdges(map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);
          overlayPane.selectAll('.edges').remove();
        }

        function renderEdges(edges, map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);

          // remove all old clusterConnections
          overlayPane.selectAll('.edges').remove();

          var svg = overlayPane.append('svg').attr('class', 'leaflet-zoom-hide edges');
          var g = svg.append('g');

          edges = edges.map(function(edge) {
            return [
                { x: edge.lat_in, y: edge.lng_in },
                { x: edge.lat_out, y: edge.lng_out }
              ];
          });

          var line = d3.svg.line()
            .x(function(d) { return map.latLngToLayerPoint(new L.LatLng(d.x, d.y)).x; })
            .y(function(d) { return map.latLngToLayerPoint(new L.LatLng(d.x, d.y)).y; })
            .interpolate('cardinal');

          var feature = g.selectAll('path')
            .data(edges)
            .enter().append('path')
            .attr('class', 'line')
            .attr('d', line)
            .attr('stroke', '#009688')
            .attr('stroke-width', 5)
            .style('opacity', 0.6);

          map.on('viewreset', update);
          update();

          /* Update size and scaling of svgs on mapchange */
          function update() {
            var bounds = getBounds(edges);

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
