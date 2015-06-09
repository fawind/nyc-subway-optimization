angular.module('epic-taxi')
  .directive("cluster", function() {
    // cluster: {'lat' : '123', 'lng': '123'}

    return {
      require: 'leaflet',
      scpope: 'false',
      replace: 'false',
      link: function(scope, element, attrs, leafletController) {

        var svg = d3.select(element[0])
              .append("svg");

        scope.$watch('cluster', function(newCluster, oldCluster) {
          if (!newCluster) return;
          return scope.render(newCluster);
        });

        scope.render = function(cluster) {
          var data =  [ {LatLng: new L.LatLng(cluster.lat, cluster.lng)} ];

          svg.selectAll('*').remove();

          svg.selectAll('circle')
            .data(data)
            .enter().append('circle')
            .style("stroke", "black")
            .style("opacity", 0.6)
            .style("fill", "red")
            .attr("r", 20);
        };
      }
    };
  });
