var clientPool = require('./hana');
var geo = require('./utils/geo');
var Promise = require('bluebird');
var fs = require('fs');
require('array.prototype.findindex');

var QueryHandler = {
  /**
   * Returns clusters with respective count of rides. Involve all rides going out from a given station
   * @param {id: id, lat, lng} get rides going out from here
   * @param {startDate, endDate} timeSpan of the rides
   * @param {Tuple of years} also used as timeSpan ( mutually exclusive with timeSpan)
   * @param {Number} Radius drawn around the station, 2*radius = cluster edges
   * @param {box} box containing the rectangular coordinates to cluster in
   * @return {Promise} which resolutes when query is finished
   */
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

  /**
   * Returns clusters with respective count of rides. Involve all rides going in to the given station
   * @param {id: id, lat, lng} get rides going in here
   * @param {startDate, endDate} timeSpan of the rides
   * @param {Tuple of years} also used as timeSpan ( mutually exclusive with timeSpan)
   * @param {Number} Radius drawn around the station, 2*radius = cluster edges
   * @param {box} box containing the rectangular coordinates to cluster in
   * @return {Promise} which resolutes when query is finished
   */
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

  /**
   * Returns array of all rides filtered. Involve all rides going out from the given station.
   * NB: Extremely high amount of data is possible - so long streaming time
   * @param {id: id, lat, lng} get rides going out from here
   * @param {startDate, endDate} timeSpan of the rides
   * @param {Tuple of years} also used as timeSpan ( mutually exclusive with timeSpan)
   * @param {Number} Radius drawn around the station, 2*radius = cluster edges
   * @param {box} box containing the rectangular coordinates to cluster in
   * @return {Promise} which resolutes when query is finished
   */
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

  /**
   * Returns array of all rides filtered. Involve all rides going in to the given station.
   * NB: Extremely high amount of data is possible - so long streaming time
   * @param {id: id, lat, lng} get rides going in here
   * @param {startDate, endDate} timeSpan of the rides
   * @param {Tuple of years} also used as timeSpan ( mutually exclusive with timeSpan)
   * @param {Number} Radius drawn around the station, 2*radius = cluster edges
   * @param {box} box containing the rectangular coordinates to cluster in
   * @return {Promise} which resolutes when query is finished
   */
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

  /**
   * Get all edges which are generated by the EdgeCalculator. Apply optional filters
   * @param {box} retrieve only edges within the box
   * @param {Boolean} filter rides based on near subway stations
   * @param {Number} minimum amount of counts for an edge
   * @param {Number} maximum length for an edge
   * @param {Number} amount of edges to be retrieved
   * @param {Promise} resolutes to function with one parameter (result)
   */
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
  },

  /**
   * Get all rides covered by a given line of stations and radius
   * @param {Array} of stations with lat and lng
   * @param {Number} block size to span on station (radius)
   * @return {Promise} Promise resolving with sum of counts
   */
  getSubwayWeight: function(stations, radius) {
    var queryList = [];

    for(i = 0; i < stations.length; i++) {
      var ext = getExtent(stations[i], radius);
      var baseQuery = 'SELECT COUNT(ID) as count FROM NYCCAB.TRIP' +
        ' WHERE PICKUP_LAT <= ' + ext.latMax.toFixed(6) + ' AND PICKUP_LAT >= ' + ext.latMin.toFixed(6) +
        ' AND PICKUP_LONG <= ' + ext.lngMax.toFixed(6) + ' AND PICKUP_LONG >= ' + ext.lngMin.toFixed(6);
      var subQueryList = [];

      for(j = 0; j < stations.length; j++) {
        if (j == i) continue;
        subQueryList.push(getStationQuery(stations[j], radius));
      }

      queryList.push(baseQuery + ' AND (' + subQueryList.join(' OR ') + ')');
    }

    var query = 'SELECT SUM(count) as sum FROM (' + queryList.join(' UNION ALL ') + ')';
    
    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows[0].sum); },
        function(error) { reject(error); }
      );
    });
  }
};

/**
 * Convert directed edges to undirected (merge those edges)
 * @param {Array of edges} to be merged if possible
 * @return {Array of edges} containing only undirected edges
 */
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

/**
 * Get the box for a station given a 'radius' which is then half of one edge
 * @param {Number} station with lat and lng
 * @param {Number} radius
 * @return {Extent} range of latitude and longitude
 */
function getExtent(station, radius) {
  var latMax = geo.getTranslatedPoint(station.lat, station.lng, radius, 0).lat;
  var latMin = geo.getTranslatedPoint(station.lat, station.lng, radius, 180).lat;
  var lngMax = geo.getTranslatedPoint(station.lat, station.lng, radius, 90).lng;
  var lngMin = geo.getTranslatedPoint(station.lat, station.lng, radius, 270).lng;

  return {
    latMax: latMax,
    latMin: latMin,
    lngMax: lngMax,
    lngMin: lngMin
  };
}

/**
 * Generate query to get rides which end around a station
 * @param {Station} with lat and lng value
 * @param {radius} around the station
 * @return {String} Query part
 */
function getStationQuery(station, radius) {
  var ext = getExtent(station, radius)
  var query = '(DROPOFF_LAT <= ' + ext.latMax.toFixed(6) + ' AND DROPOFF_LAT >= ' + ext.latMin.toFixed(6) +
              ' AND DROPOFF_LONG <= ' + ext.lngMax.toFixed(6) + ' AND DROPOFF_LONG >= ' + ext.lngMin.toFixed(6) + ')';

  return query;
}

module.exports = QueryHandler;
