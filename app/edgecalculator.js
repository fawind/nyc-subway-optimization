var Promise = require('bluebird');
var fs = require('fs');
var clientPool = require('./hana');
var QueryHandler = require('./queries');
var geo = require('./utils/geo');

var EdgeCalculator = {
  getAllClusterSequential: function(radius, exportFile, insertDB) {
    var box = {topLeft: { lat: 40.864695, lng: -74.01976 }, bottomRight: { lat: 40.621053, lng: -73.779058 }};
    var dates = [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ];
    var years = [ '2010', '2011', '2012', '2013' ];
    var attr = { dates: dates, years: years, radius: radius, box: box };
    // ================================================================
    // For each square containing the circle cluster all outgoing rides
    // which would be equivalent to doing the same with incoming (=same edges).

    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, radius);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, radius);
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
      EdgeCalculator.executeRecursive(queries, attr, resultList, resolve, reject, exportFile, insertDB);
    });
  },

  executeRecursive: function(queries, attr, resultList, resolve, reject, exportFile, insertDB) {
    if (queries.length === 0) {
      resolve(resultList);
    }
    else {
      latLng = queries.pop();
      QueryHandler.getClusterOutgoing(latLng, attr.dates, attr.years, attr.radius, attr.box)
        .then(function(rows) {
          var result = { lat: latLng.lat, lng: latLng.lng, endPoints: rows }
          resultList.push('one_more');
          if (exportFile)
            saveToFile(latLng, result);
          if (insertDB)
            EdgeCalculator.insertRideEdges(result);

          EdgeCalculator.executeRecursive(queries, attr, resultList, resolve, reject, exportFile, insertDB);
        })
        .catch(function(error) { reject(error); });
    }
  },

  getSubwayStations: function() {
    var query = 'SELECT LAT as "lat", LNG as "lng" FROM NYCCAB.SUBWAY_STATION';

    return new Promise(function(resolve, reject) {
      clientPool.query(
        query,
        function(rows) { resolve(rows); },
        function(error) { reject(error); }
      );
    });
  },

  insertRideEdges: function(result) {
    // convert result to rows
    var bulk = edgesToRows(result);
    // add data about stations in cluster
    addSubwayToEdges(bulk, false, function(res) {
      bulk = addDistanceToEdges(res);
      var statement = 'INSERT INTO NYCCAB.RIDE_EDGES values (?, ?, ?, ?, ?, ?, ?, ?)';
      clientPool.insertBulk(statement, bulk, function(affectedRows) {
        console.log(affectedRows.length, 'rows affected by insert');
      }, function(err) {
        console.log(err);
      });
    });
  }
}

function saveToFile(latLng, edges) {
  var path = '/tmp/' + String(latLng.lat) + 'x' + String(latLng.lng) + '.json';
  fs.writeFile(path, JSON.stringify(edges, null, '\t'), function(err) {
    if (err)
      console.log(err);
    else
      console.log("saved tmp data to:", path);
  });
}

function edgesToRows(edges) {
  rows = [];
  for (i = 0; i < edges.endPoints.length; i++) {
    var temp = edges.endPoints[i];
    rows.push([edges.lat, edges.lng, temp.count, Number(temp.lat), Number(temp.lng)]);
  }
  return rows;
}

function addSubwayToEdges(edges, del, cb, error) {
  EdgeCalculator.getSubwayStations()
    .then(function(rows) {
      var length = edges.length;
      edges.forEach(function(curVal) {
        curVal.splice(2, 0, subwayInReach(curVal[0], curVal[1], 500, rows));
        curVal.splice(6, 0, subwayInReach(curVal[4], curVal[5], 500, rows));
      });

      if (del) {
        // delete edges between two subway stations
        edges = edges.filter(function(curVal) {
          return !(curVal[2] && curVal[6]);
        });
      }

      console.log('eliminated', length - edges.length, 'rows');

      cb(edges);
    })
    .catch(function(err) {
      error(err);
    });
}

function subwayInReach(lat, lng, range, stations) {
  for(i = 0; i < stations.length; i++) {
    if (geo.getDistance_m(lat, lng, stations[i].lat, stations[i].lng) <= range)
      return 1;
  }
  return 0;
}

function addDistanceToEdges(edges) {
  for (i = 0; i < edges.length; i++) {
    var distance = geo.getDistance_m(edges[i][0], edges[i][1], edges[i][4], edges[i][5]);
    edges[i].push(distance);
  }
  return edges;
}

module.exports = EdgeCalculator;