var clientPool = require('./hana');
var geo = require('./utils/geo');

var QueryHandler = {
  get_cluster: function(lat_st, lng_st, from, to, years, daytimes, raster_deg, cb) {
    var from = ((new Date(from)).toISOString().substring(0, 10))
    var to = ((new Date(to)).toISOString().substring(0, 10))

    var offset_lng = geo.getLngDiff / (raster_deg * 2)
    var offset_lat = geo.getLatDiff / (raster_deg * 2)

    var lat = geo.getBottomRight.lat + offset_lat
    var lng = geo.getTopLeft.lng + offset_lng

    // filter rides which start in the area around the given station (box defined by 2*offsetX x 2*offsetY)
    var basePickup = 'PICKUP_LONG < '+(lng_st + offset_lng).toFixed(6)+' AND PICKUP_LONG > '+(lng_st - offset_lng).toFixed(6)+
      ' AND PICKUP_LAT < '+(lat_st + offset_lat).toFixed(6)+' AND PICKUP_LAT > '+(lat_st - offset_lat).toFixed(6);

    var yearFilter = ' AND year(PICKUP_TIME) IN ('+years.join(', ')+')';

    var fromToFilter = " AND PICKUP_TIME >= '" + from + "' AND PICKUP_TIME <= '" + to + "'"

    var queryList = [];
    // start in the south of NYC
    while(lat < geo.getTopLeft.lat) {
      // start in the west of NYC
      while(lng < geo.getBottomRight.lng) {
        queryList.push('SELECT COUNT(ID) AS "count", '+lat.toFixed(6)+' as "lat", '+lng.toFixed(6)+'as "lng"'+
          ' FROM NYCCAB.TRIP WHERE '+basePickup+fromToFilter+
          ' AND DROPOFF_LONG < '+(lng + offset_lng).toFixed(6)+' AND DROPOFF_LONG > '+(lng - offset_lng).toFixed(6)+
          ' AND DROPOFF_LAT < '+(lat + offset_lat).toFixed(6)+' AND DROPOFF_LAT > '+(lat - offset_lat).toFixed(6));

        // increase longitude for next iteration by one box-size
        lng = lng + 2 * offset_lng
      };
      // increase latitude for next iteration by one box-size
      lat = lat + 2 * offset_lat
      // reset longitude
      lng = geo.getTopLeft.lng
    };

    var query = queryList.join(' UNION ALL ');

    console.log(encodeURI(query).split(/%..|./).length - 1);

    clientPool.simpleQuery(query, cb);
  }
};

module.exports = QueryHandler;
