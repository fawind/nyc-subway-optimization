angular.module('epic-taxi')
  .directive("cluster", ['lodash', function(_) {
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
          var overlayPane = d3.select(map._panes.overlayPane);

          // remove all old cluster
          overlayPane.selectAll(".cluster").remove();

          var svg = overlayPane.append("svg").attr("class", "leaflet-zoom-hide cluster").attr("width", map._size.x).attr("height", map._size.y);

          _.each(cluster, function(area) {
            drawCircle(map, svg, area);
          });
        };

        function drawCircle(map, svg, area) {
          var data =  [ {LatLng: new L.LatLng(area.lat, area.lng)} ];

          var g = svg.append('g');
          var feature = g.selectAll('circle')
            .data(data)
            .enter().append('circle')
            .style("stroke", "black")
            .style("opacity", 0.6)
            .style("fill", "red")
            .attr("r", 20);

          update();

          function update() {
            feature.attr('transform', function(d) {
              return "translate("+
                        map.latLngToLayerPoint(d.LatLng).x +","+
                        map.latLngToLayerPoint(d.LatLng).y +")";
            });
          }
          map.on("viewreset", update);
        }
      }
    };
  }]);
