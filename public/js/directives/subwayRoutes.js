angular.module('epic-taxi')
  .directive("subway", function() {
    return {
      require: 'leaflet',
      link: function(scope, element, routes, leafletController) {
        console.log('scope: ' + leafletController.getLeafletScope());
      }
    };
  });
