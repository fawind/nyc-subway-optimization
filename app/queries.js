var clientPool = require('./hana');
var geo = require('./utils/geo');
var Promise = require('bluebird');
var fs = require('fs');

var QueryHandler = {
  getClusterOutgoing: function(station, timeSpan, years, blockSize, box) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
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

    /* filter based on specific daytimes (morning, midday, evening, night)
    daytimes = daytimes.map(function(d) {
      return '(hour(cast(PICKUP_TIME as SECONDDATE)) >= '+d[0]+' AND hour(cast(PICKUP_TIME as SECONDDATE)) <= '+d[1]+')'
    }).join(' OR ');
    var daytimeFilter = ' AND (' + daytimes + ')'
    */

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM(' + innerQuery + ') WHERE ' +
      basePickup + fromToFilter + yearFilter + ' GROUP BY lat, lng';

    // just for testing reasons
    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));
    //console.log(query);

    // execute query
    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getClusterIncoming: function(station, timeSpan, years, blockSize, box) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
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

    /* filter based on specific daytimes (morning, midday, evening, night)
    daytimes = daytimes.map(function(d) {
      return '(hour(cast(PICKUP_TIME as SECONDDATE)) >= '+d[0]+' AND hour(cast(PICKUP_TIME as SECONDDATE)) <= '+d[1]+')'
    }).join(' OR ');
    var daytimeFilter = ' AND (' + daytimes + ')'
    */

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM(' + innerQuery + ') WHERE ' +
      basePickup + fromToFilter+yearFilter + ' GROUP BY lat, lng';

    // just for testing reasons
    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));
    //console.log(query);

    // execute query
    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  getAllCluster: function(blockSize) {
    var box = {topLeft: { lat: 40.864695, lng: -74.01976 }, bottomRight: { lat: 40.621053, lng: -73.779058 }};
    var dates = [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ];
    var years = [ '2010', '2011', '2012', '2013' ];
    // ================================================================
    // For each blocksize x blocksize square cluster all outgoing rides
    // which would be equivalent to doing the same with incoming (=same edges).

    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
    var lat = box.bottomRight.lat + offsetLat;
    var lng = box.topLeft.lng + offsetLng;

    var promises = [];
    var resultList = [];
    // start in the south of NYC
    while (lat < box.topLeft.lat) {
      // start in the west of NYC
      while (lng < box.bottomRight.lng) {
        promises.push(QueryHandler.getClusterOutgoing({lng: lng, lat: lat}, dates, years, blockSize, box)
          .then(function(rows) { resultList.push({ lat: lat, lng: lng, endPoints: rows }); })
          .catch(function(err) { console.log(err); }));

        // increase longitude for next iteration by one box-size
        lng = lng + (2 * offsetLng);
      }
      // increase latitude for next iteration by one box-size
      lat = lat + (2 * offsetLat);
      // reset longitude
      lng = box.topLeft.lng + offsetLng;
    }

    // resultList wanted here
    return Promise.all(promises)
      .then(function() {
        return resultList;
      });
  },

  getAllClusterSequential: function(blockSize, exportFile, insertDB) {
    var box = {topLeft: { lat: 40.864695, lng: -74.01976 }, bottomRight: { lat: 40.621053, lng: -73.779058 }};
    var dates = [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ];
    var years = [ '2010', '2011', '2012', '2013' ];
    var attr = { dates: dates, years: years, blockSize: blockSize, box: box };
    // ================================================================
    // For each blocksize x blocksize square cluster all outgoing rides
    // which would be equivalent to doing the same with incoming (=same edges).

    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
    var lat = box.bottomRight.lat + offsetLat;
    var lng = box.topLeft.lng + offsetLng;

    var queries = [];
    var resultList = [];

    /* Add lat-lngs to query-list */
    // start in the south of NYC
    while (lat < box.topLeft.lat) {
      // start in the west of NYC
      while (lng < box.bottomRight.lng) {
        queries.push({ lng: lng, lat: lat });

        // increase longitude for next iteration by one box-size
        lng = lng + (2 * offsetLng);
      }
      // increase latitude for next iteration by one box-size
      lat = lat + (2 * offsetLat);
      // reset longitude
      lng = box.topLeft.lng + offsetLng;
    }

    // Execute a query for each lat-lng recursively
    return new Promise(function(resolve, reject) {
      QueryHandler.executeRecursive(queries, attr, resultList, resolve, reject, exportFile, insertDB);
    });
  },

  executeRecursive: function(queries, attr, resultList, resolve, reject, exportFile, insertDB) {
    if (queries.length === 0) {
      resolve(resultList);
    }
    else {
      latLng = queries.pop();
      QueryHandler.getClusterOutgoing(latLng, attr.dates, attr.years, attr.blockSize, attr.box)
        .then(function(rows) {
          var result = { lat: latLng.lat, lng: latLng.lng, endPoints: rows }
          resultList.push(result);
          if (exportFile)
            QueryHandler.saveToFile(latLng, result);
          if (insertDB)
            QueryHandler.insertRideEdges(result);

          QueryHandler.executeRecursive(queries, attr, resultList, resolve, reject, exportFile, insertDB);
        })
        .catch(function(error) { reject(error); });
    }
  },

  saveToFile: function(latLng, edges) {
    var path = '/tmp/' + String(latLng.lat) + 'x' + String(latLng.lng) + '.json';
    fs.writeFile(path, JSON.stringify(edges, null, '\t'), function(err) {
      if (err)
        console.log(err);
      else
        console.log("saved tmp data to:", path);
    });
  },

  edgesToRows: function(edges) {
    rows = []
    for (i = 0; i < edges.endPoints.length; i++) {
      var temp = edges.endPoints[i];
      rows.push([edges.lat, edges.lng, temp.count, Number(temp.lat), Number(temp.lng)]);
    }
    return rows;
  },

  insertRideEdges: function(result) {
    // convert result to rows
    var bulk = QueryHandler.edgesToRows(result);
    // add data about stations in cluster
    QueryHandler.addSubwayToEdges(bulk, function(res) {
      bulk = res;
      var statement = 'INSERT INTO NYCCAB.RIDE_EDGES values (?, ?, ?, ?, ?, ?, ?)';
      clientPool.insertBulk(statement, bulk, function(affectedRows) {
        console.log(affectedRows.length, 'rows affected by insert');
      }, function(err) {
        console.log(err);
      });
    });
  },

  getSubwayStations: function() {
    var query = 'SELECT LATITUDE as "lat", LONGITUDE as "lng" FROM NYCCAB.SUBWAY_STATION';

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  addSubwayToEdges: function(edges, cb, error) {
    QueryHandler.getSubwayStations()
      .then(function(rows) {
        var length = edges.length;
        edges.forEach(function(curVal, index) {
          curVal.splice(2, 0, QueryHandler.subwayInReach(curVal[0], curVal[1], 700, rows));
          curVal.splice(6, 0, QueryHandler.subwayInReach(curVal[4], curVal[5], 700, rows));
        });

        edges = edges.filter(function(curVal, index) {
          return !(curVal[2] && curVal[6]);
        });

        console.log('eliminated', length - edges.length, 'rows');

        cb(edges);
      })
      .catch(function(err) {
        error(err);
      });
  },

  subwayInReach: function(lat, lng, range, stations) {
    for(i = 0; i < stations.length; i++) {
      if (geo.getDistance_m(lat, lng, stations[i].lat, stations[i].lng) < range)
        return 1;
    }
    return 0;
  }
};

module.exports = QueryHandler;
