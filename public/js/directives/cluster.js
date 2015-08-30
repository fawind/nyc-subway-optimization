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

        /* Update the cluster view */
        function render(cluster, map) {
          if (cluster.cluster === undefined)
            removeCluster(map);
          else
            renderCluster(cluster, map);
        }

        /* Remove all rendered cluster */
        function removeCluster(map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);
          overlayPane.selectAll('.cluster').remove();
        }

        /* Draw given cluster on the map */
        function renderCluster(cluster, map) {
          var overlayPane = d3.select(map.getPanes().overlayPane);
          removeCluster(map);

          var svg = overlayPane.append('svg').attr('class', 'leaflet-zoom-hide cluster');
          var g = svg.append('g');

          var min = _.min(cluster.cluster, 'count').count;
          var max = _.max(cluster.cluster, 'count').count;

          var color = d3.scale.linear()
            .domain([min, max])
            .range(['#FFECB3', '#FFA000']);

          var gridSize = cluster.gridSize;
          var features = cluster.cluster.map(function(area) {
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

          var tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('z-index', '10')
            .style('visibility', 'hidden')
            .text('cluster');

          /* Add a circle for each feature */
          var feature = g.selectAll('circle')
            .data(features)
            .enter().append('circle')
            .style('opacity', 0.6)
            .style('fill', function(d) { return color(d.properties.count); })
            .on('mouseover', function(d) {
              d3.select(this).style('fill', '#FFEB3B');
              return tooltip.style('visibility', 'visible').text(d.properties.count + ' rides');
            })
            .on('mousemove', function() {
              return tooltip.style('top', event.pageY + 'px').style('left', event.pageX + 20 + 'px');
            })
            .on('mouseout', function(d) {
              d3.select(this).style('fill', function(d) { return color(d.properties.count); });
              return tooltip.style('visibility', 'hidden');
            });

          map.on('viewreset', update);
          update();

          /* Update size and scaling of svgs on map change */
          function update() {
            var bounds = getBounds(features);
            var radius = gridSize / 120000 * Math.pow(2, map.getZoom());

            var width = Math.abs((bounds.max[0] - bounds.min[0]) + 2 * radius);
            var height = Math.abs((bounds.max[1] - bounds.min[1]) + 2 * radius);
            var left = bounds.min[0] - radius;
            var top = bounds.min[1] - radius;

            svg.attr('width', width).attr('height', height)
              .style('left', left + 'px')
              .style('top', top + 'px');

            g.attr('transform', 'translate(' + -bounds.min[0] + ',' + -bounds.min[1] + ')');

            g.selectAll('circle')
              .attr('cx', function(d) { return map.latLngToLayerPoint(d.LatLng).x + radius; })
              .attr('cy', function(d) { return map.latLngToLayerPoint(d.LatLng).y + radius;})
              .attr('r', radius);
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
        }
      }
    };
  }]);
