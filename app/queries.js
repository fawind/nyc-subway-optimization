var clientPool = require('./hana');
var geo = require('./utils/geo');

var QueryHandler = {
  getClusterOutgoing: function(station, timeSpan, years, daytimes, blockSize, box, cb) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required 
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
    var lat = box.bottomRight.lat + offsetLat
    var lng = box.topLeft.lng + offsetLng

    var queryList = [];
    // start in the south of NYC
    while(lat < box.topLeft.lat) {
      // start in the west of NYC
      while(lng < box.bottomRight.lng) {
        queryList.push('SELECT ID, PICKUP_LAT, PICKUP_LONG, PICKUP_TIME, '+lat.toFixed(6)+' as lat, '+lng.toFixed(6)+' as lng'+
          ' FROM NYCCAB.TRIP WHERE'+
          ' DROPOFF_LONG <= '+(lng + offsetLng).toFixed(6)+' AND DROPOFF_LONG >= '+(lng - offsetLng).toFixed(6)+
          ' AND DROPOFF_LAT <= '+(lat + offsetLat).toFixed(6)+' AND DROPOFF_LAT >= '+(lat - offsetLat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + (2*offsetLng)
      };
      // increase latitude for next iteration by one box-size
      lat = lat + (2*offsetLat)
      // reset longitude
      lng = box.topLeft.lng
    };

    var innerQuery = queryList.join(' UNION ALL ');

    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going OUT from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.
    
    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'PICKUP_LONG < '+(station.lng + offsetLng).toFixed(6)+' AND PICKUP_LONG > '+(station.lng - offsetLng).toFixed(6)+
      ' AND PICKUP_LAT < '+(station.lat + offsetLat).toFixed(6)+' AND PICKUP_LAT > '+(station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan.from)).toISOString().substring(0, 10))
    var to = ((new Date(timeSpan.to)).toISOString().substring(0, 10))

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'"

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN ('+years.join(', ')+')';

    // filter based on specific daytimes (morning, midday, evening, night)
    daytimes = daytimes.map(function(d) {
      return '(hour(cast(PICKUP_TIME as SECONDDATE)) >= '+d[0]+' AND hour(cast(PICKUP_TIME as SECONDDATE)) <= '+d[1]+')'
    }).join(' OR ');
    var daytimeFilter = ' AND (' + daytimes + ')'

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM('+innerQuery+') WHERE '+basePickup+fromToFilter+yearFilter+' GROUP BY lat, lng'

    // just for testing reasons 
    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));
    //console.log(query);

    // execute query
    clientPool.simpleQuery(query, cb);
  },

  getClusterIncoming: function(station, timeSpan, years, daytimes, blockSize, box, cb) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required 
    // data per cluster and additionally the midpoint as lat and lng.
    var offsetLat = geo.getLatDiff(box.topLeft.lat, box.bottomRight.lat, blockSize);
    var offsetLng = geo.getLngDiff(box.topLeft.lng, box.bottomRight.lng, blockSize);
    var lat = box.bottomRight.lat + offsetLat
    var lng = box.topLeft.lng + offsetLng

    var queryList = [];
    // start in the south of NYC
    while(lat < box.topLeft.lat) {
      // start in the west of NYC
      while(lng < box.bottomRight.lng) {
        queryList.push('SELECT ID, DROPOFF_LAT, DROPOFF_LONG, PICKUP_TIME, '+lat.toFixed(6)+' as lat, '+lng.toFixed(6)+' as lng'+
          ' FROM NYCCAB.TRIP WHERE'+
          ' PICKUP_LONG <= '+(lng + offsetLng).toFixed(6)+' AND PICKUP_LONG >= '+(lng - offsetLng).toFixed(6)+
          ' AND PICKUP_LAT <= '+(lat + offsetLat).toFixed(6)+' AND PICKUP_LAT >= '+(lat - offsetLat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + (2*offsetLng)
      };
      // increase latitude for next iteration by one box-size
      lat = lat + (2*offsetLat)
      // reset longitude
      lng = box.topLeft.lng
    };

    var innerQuery = queryList.join(' UNION ALL ');

    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going IN from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.
    
    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'DROPOFF_LONG < '+(station.lng + offsetLng).toFixed(6)+' AND DROPOFF_LONG > '+(station.lng - offsetLng).toFixed(6)+
      ' AND DROPOFF_LAT < '+(station.lat + offsetLat).toFixed(6)+' AND DROPOFF_LAT > '+(station.lat - offsetLat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(timeSpan.from)).toISOString().substring(0, 10))
    var to = ((new Date(timeSpan.to)).toISOString().substring(0, 10))

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'"

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN ('+years.join(', ')+')';

    // filter based on specific daytimes (morning, midday, evening, night)
    daytimes = daytimes.map(function(d) {
      return '(hour(cast(PICKUP_TIME as SECONDDATE)) >= '+d[0]+' AND hour(cast(PICKUP_TIME as SECONDDATE)) <= '+d[1]+')'
    }).join(' OR ');
    var daytimeFilter = ' AND (' + daytimes + ')'

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM('+innerQuery+') WHERE '+basePickup+fromToFilter+yearFilter+' GROUP BY lat, lng'

    // just for testing reasons 
    console.log('DB Query size: ' + String(encodeURI(query).split(/%..|./).length - 1));
    //console.log(query);

    // execute query
    clientPool.simpleQuery(query, cb);
  }
};

module.exports = QueryHandler;
