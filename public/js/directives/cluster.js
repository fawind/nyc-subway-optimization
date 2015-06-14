angular.module('epic-taxi')
  .directive("cluster", function() {
    // cluster: {'lat' : '123', 'lng': '123'}

    return {
      require: 'leaflet',
      replace: 'false',
      link: function(scope, element, attrs, leafletController) {

        scope.$watch('cluster', function(newCluster, oldCluster) {
          if (!newCluster) return;

          leafletController.getMap()
            .then(function(map) {
              return scope.render(newCluster[0], map);
            });
        });

        scope.render = function(cluster, map) {
          console.log(cluster);
          console.log(map);
          var svg = d3.select(map._panes.overlayPane).append("svg");
          svg.selectAll('*').remove();
          var g = svg.append('g').attr("class", "leaflet-zoom-animated");

          var data =  [ {LatLng: new L.LatLng(cluster.lat, cluster.lng)} ];

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
        };
      }
    };
  });
