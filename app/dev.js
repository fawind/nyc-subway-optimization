var QueryHandler = require('./queries');
var geo = require('./utils/geo');
var clientPool = require('./hana');

var getAllCluster = function() {
  var blockSize = 4000;
  var box = {topLeft: { lat: 40.864695, lng: -74.01976 }, bottomRight: { lat: 40.621053, lng: -73.779058 }};
  // ================================================================
  // For each blocksize x blocksize square cluster all outgoing rides
  // which would be equivalent to doing the same with incoming (=same edges).

  var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
  var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
  var lat = box.bottomRight.lat + offsetLat;
  var lng = box.topLeft.lng + offsetLng;

  var resultList = [];
  // start in the south of NYC
  while(lat < box.topLeft.lat) {
    // start in the west of NYC
    while(lng < box.bottomRight.lng) {
      QueryHandler.getClusterOutgoing({lng: lng, lat: lat}, [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ],
        [ '2010', '2011', '2012', '2013' ], 3, blockSize, box, function(rows) {
          resultList.push(rows);
        });

      // increase longitude for next iteration by one box-size
      lng = lng + (2 * offsetLng);
    };
    // increase latitude for next iteration by one box-size
    lat = lat + (2 * offsetLat);
    // reset longitude
    lng = box.topLeft.lng + offsetLng;
  };

  // resultList wanted here
}

var getAllStationsSorted = function(){
  var query = "SELECT latitude as lat, longitude as lng FROM NYCCAB.SUBWAY_STATION
               ORDER BY lat ASC, lng ASC";
               
  clientPool.simpleQuery(query, function(rows) {
    console.log(rows);
  });
}
