var clientPool = require('./hana');
var geo = require('./utils/geo');
var Promise = require('bluebird');
var fs = require('fs');
require('array.prototype.findindex');

var QueryHandler = {
  getClusterOutgoing: function(station, timeSpan, years, radius, box) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, radius);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, radius);
    var lat = box.bottomRight.lat + offsetLat;
    var lng = box.topLeft.lng + offsetLng;

    var queryList = [];
    // start in the south of NYC
    while (lat < box.topLeft.lat) {
      // start in the west of NYC
      while (lng < box.bottomRight.lng) {
        queryList.push('SELECT ID, PICKUP_LAT, PICKUP_LONG, PICKUP_TIME, ' + lat.toFixed(6) + ' as lat, ' + lng.toFixed(6) + ' as lng' +
          ' FROM NYCCAB.TRIP WHERE' +
          ' DROPOFF_LONG <= ' + (lng + offsetLng).toFixed(6) + ' AND DROPOFF_LONG >= ' + (lng - offsetLng).toFixed(6) +
          ' AND DROPOFF_LAT <= ' + (lat + offsetLat).toFixed(6) + ' AND DROPOFF_LAT >= ' + (lat - offsetLat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + (2 * offsetLng);
      }
      // increase latitude for next iteration by one box-size
      lat = lat + (2 * offsetLat);
      // reset longitude
      lng = box.topLeft.lng + offsetLng;
    }

    var innerQuery = queryList.join(' UNION ALL ');

    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going OUT from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.

    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'PICKUP_LONG < ' + (station.lng + offsetLng).toFixed(6) + ' AND PICKUP_LONG > ' + (station.lng - offsetLng).toFixed(6) +
      ' AND PICKUP_LAT < ' + (station.lat + offsetLat).toFixed(6) + ' AND PICKUP_LAT > ' + (station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan[0])).toISOString().substring(0, 10));
    var to = ((new Date(timeSpan[1])).toISOString().substring(0, 10));

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'";

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN (' + years.join(', ') + ')';

    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM(' + innerQuery + ') WHERE ' +
      basePickup + fromToFilter + yearFilter + ' GROUP BY lat, lng';

    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getClusterIncoming: function(station, timeSpan, years, radius, box) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, radius);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, radius);
    var lat = box.bottomRight.lat + offsetLat;
    var lng = box.topLeft.lng + offsetLng;

    var queryList = [];
    // start in the south of NYC
    while (lat < box.topLeft.lat) {
      // start in the west of NYC
      while (lng < box.bottomRight.lng) {
        queryList.push('SELECT ID, DROPOFF_LAT, DROPOFF_LONG, PICKUP_TIME, ' + lat.toFixed(6) + ' as lat, ' + lng.toFixed(6) + ' as lng' +
          ' FROM NYCCAB.TRIP WHERE' +
          ' PICKUP_LONG <= ' + (lng + offsetLng).toFixed(6) + ' AND PICKUP_LONG >= ' + (lng - offsetLng).toFixed(6) +
          ' AND PICKUP_LAT <= ' + (lat + offsetLat).toFixed(6) + ' AND PICKUP_LAT >= ' + (lat - offsetLat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + (2 * offsetLng);
      }
      // increase latitude for next iteration by one box-size
      lat = lat + (2 * offsetLat);
      // reset longitude
      lng = box.topLeft.lng + offsetLng;
    }

    var innerQuery = queryList.join(' UNION ALL ');

    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going IN from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.

    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'DROPOFF_LONG < ' + (station.lng + offsetLng).toFixed(6) + ' AND DROPOFF_LONG > ' + (station.lng - offsetLng).toFixed(6) +
      ' AND DROPOFF_LAT < ' + (station.lat + offsetLat).toFixed(6) + ' AND DROPOFF_LAT > ' + (station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan[0])).toISOString().substring(0, 10));
    var to = ((new Date(timeSpan[1])).toISOString().substring(0, 10));

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'";

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN (' + years.join(', ') + ')';

    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM(' + innerQuery + ') WHERE ' +
      basePickup + fromToFilter+yearFilter + ' GROUP BY lat, lng';

    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getPointsOutgoing: function(station, timeSpan, years, radius, box) {
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, radius);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, radius);
    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going OUT from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.

    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'PICKUP_LONG < ' + (station.lng + offsetLng).toFixed(6) + ' AND PICKUP_LONG > ' + (station.lng - offsetLng).toFixed(6) +
      ' AND PICKUP_LAT < ' + (station.lat + offsetLat).toFixed(6) + ' AND PICKUP_LAT > ' + (station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan[0])).toISOString().substring(0, 10));
    var to = ((new Date(timeSpan[1])).toISOString().substring(0, 10));

    var inBoxFilter = ' AND DROPOFF_LAT < ' + box.topLeft.lat + ' AND DROPOFF_LAT > ' + box.bottomRight.lat +
      ' AND DROPOFF_LONG < ' + box.bottomRight.lng + ' AND DROPOFF_LONG > ' + box.topLeft.lng;

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'";

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN (' + years.join(', ') + ')';

    var query = 'SELECT DROPOFF_LAT as "lat", DROPOFF_LONG as "lng" FROM NYCCAB.TRIP WHERE ' +
      basePickup + inBoxFilter + fromToFilter + yearFilter + ' GROUP BY DROPOFF_LAT, DROPOFF_LONG';

    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getPointsIncoming: function(station, timeSpan, years, radius, box) {
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, radius);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, radius);
    // ================================================================
    // All given filters are applied on the rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going IN from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.

    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'DROPOFF_LONG < ' + (station.lng + offsetLng).toFixed(6) + ' AND DROPOFF_LONG > ' + (station.lng - offsetLng).toFixed(6) +
      ' AND DROPOFF_LAT < ' + (station.lat + offsetLat).toFixed(6) + ' AND DROPOFF_LAT > ' + (station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan[0])).toISOString().substring(0, 10));
    var to = ((new Date(timeSpan[1])).toISOString().substring(0, 10));

    var inBoxFilter = ' AND PICKUP_LAT < ' + box.topLeft.lat + ' AND PICKUP_LAT > ' + box.bottomRight.lat +
      ' AND PICKUP_LONG < ' + box.bottomRight.lng + ' AND PICKUP_LONG > ' + box.topLeft.lng;

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'";

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN (' + years.join(', ') + ')';

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT PICKUP_LAT as "lat", PICKUP_LONG as "lng" FROM NYCCAB.TRIP WHERE ' +
      basePickup + inBoxFilter + fromToFilter + yearFilter + ' GROUP BY PICKUP_LAT, PICKUP_LONG';

    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getEdges: function(box, filtered, countThreshold, distanceThreshold, valueLimit) {
    var filter = '';
    if (filtered) {
      filter = ' AND ((station_out = 0) OR (station_in = 0))';
    }
    // exclude edges that are simply vertices with a count (rides within a cluster)
    var excludeVertices = 150;
    var query = 'SELECT LAT_IN as "lat_in", LNG_IN as "lng_in", LAT_OUT as "lat_out", LNG_OUT as "lng_out",' +
      ' STATION_IN as "station_in", STATION_OUT as "station_out", COUNTS as "counts" FROM NYCCAB.RIDE_EDGES' +
      ' WHERE counts >= ' + countThreshold +
      ' AND DISTANCE >= ' + excludeVertices + ' AND DISTANCE <= ' + distanceThreshold +
      ' AND lat_in <= ' + box.topLeft.lat + ' AND lat_in >= ' + box.bottomRight.lat +
      ' AND lat_out <= ' + box.topLeft.lat + ' AND lat_out >= ' + box.bottomRight.lat +
      ' AND lng_in >= ' + box.topLeft.lng + ' AND lng_in <= ' + box.bottomRight.lng +
      ' AND lng_out >= ' + box.topLeft.lng + ' AND lng_out <= ' + box.bottomRight.lng +
      filter + ' ORDER BY COUNTS DESC LIMIT ' + (valueLimit * 2);

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) {
          rows = convertToUndirected(rows);
          rows = rows.slice(0, valueLimit);
          resolve(rows);
        },
        function(error) { reject(error); }
      );
    });
  }
};

function convertToUndirected(edges) {
  for (i = edges.length - 1; i >= 0; i--) {
    var index = edges.findIndex(function(curVal) {
      // find reverse edges (in and out are swapped)
      if ((geo.getDistance_m(edges[i].lat_in, edges[i].lng_in, curVal.lat_out, curVal.lng_out) < 10) &&
        (geo.getDistance_m(edges[i].lat_out, edges[i].lng_out, curVal.lat_in, curVal.lng_in) < 10))
        return true;
      return false;
    });

    if (index >= 0) {
      edges[index].counts = edges[index].counts + edges[i].counts;
      edges.splice(i, 1);
    }
  }
  return edges;
}

module.exports = QueryHandler;
