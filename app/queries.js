var clientPool = require('./hana');
var geo = require('./utils/geo');

var QueryHandler = {
  get_cluster: function(lat_st, lng_st, from, to, years, daytimes, raster_deg, cb) {
    // ================================================================
    // Generating the query by indvidiually generating each areas constraint.
    // Those parts are then put together with a UNION ALL statement between each.
    // This is basically the subquery we operate on as it gives us the required 
    // data per cluster and additionally the midpoint as lat and lng.
    var offset_lng = geo.getLngDiff / (raster_deg * 2)
    var offset_lat = geo.getLatDiff / (raster_deg * 2)
    var lat = geo.getBottomRight.lat + offset_lat
    var lng = geo.getTopLeft.lng + offset_lng

    var queryList = [];
    // start in the south of NYC
    while(lat < geo.getTopLeft.lat) {
      // start in the west of NYC
      while(lng < geo.getBottomRight.lng) {
        queryList.push('SELECT ID, PICKUP_LAT, PICKUP_LONG, PICKUP_TIME, '+lat.toFixed(6)+' as lat, '+lng.toFixed(6)+' as lng'+
          ' FROM NYCCAB.TRIP WHERE'+
          ' DROPOFF_LONG < '+(lng + offset_lng).toFixed(6)+' AND DROPOFF_LONG > '+(lng - offset_lng).toFixed(6)+
          ' AND DROPOFF_LAT < '+(lat + offset_lat).toFixed(6)+' AND DROPOFF_LAT > '+(lat - offset_lat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + 2 * offset_lng
      };
      // increase latitude for next iteration by one box-size
      lat = lat + 2 * offset_lat
      // reset longitude
      lng = geo.getTopLeft.lng
    };

    var innerQuery = queryList.join(' UNION ALL ');

    // ================================================================
    // All given filters are applied on the clustered rides. As base for the
    // filters we have 'basePickup' which essentially is a station. We only focus
    // on the rides going out from around that station (lat, lng).
    // All other filters require the ride´s time and filter on it.
    
    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'PICKUP_LONG < '+(lng_st + offset_lng).toFixed(6)+' AND PICKUP_LONG > '+(lng_st - offset_lng).toFixed(6)+
      ' AND PICKUP_LAT < '+(lat_st + offset_lat).toFixed(6)+' AND PICKUP_LAT > '+(lat_st - offset_lat).toFixed(6);

    // filter based on front-end settings for from-to value
    var from = ((new Date(from)).toISOString().substring(0, 10))
    var to = ((new Date(to)).toISOString().substring(0, 10))

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'"

    // filter based on the years we want to have a look at
    var yearFilter = ' AND year(cast(PICKUP_TIME as DATE)) IN ('+years.join(', ')+')';

    // filter based on specific daytimes (morning, midday, evening, night)
    daytimes = daytimes.map(function(d) {
      return '(hour(cast(PICKUP_TIME as SECONDDATE)) >= '+d[0]+' AND hour(cast(PICKUP_TIME as SECONDDATE)) <= '+d[1]+')'
    }).join(' OR ');
    var daytimeFilter = ' AND ('+daytimes+')'

    // query - add +daytimeFilter later as it runs more than a minute with it.
    var query = 'SELECT COUNT(ID) as "count", lat as "lat", lng as "lng" FROM('+innerQuery+') WHERE '+basePickup+fromToFilter+yearFilter+' GROUP BY lat, lng'

    // just for testing reasons 
    //console.log(encodeURI(query).split(/%..|./).length - 1);

    // execute query
    clientPool.simpleQuery(query, cb);
  }
};

module.exports = QueryHandler;
