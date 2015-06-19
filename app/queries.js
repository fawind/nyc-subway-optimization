var client = require('./hana');
var geo = require('./utils/geo');

var QueryHandler = {
  get_entry: function(lat_st, lng_st, raster_deg) {
    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      }

      var offset_lng = geo.get_lng_diff / (raster_deg * 2)
      var offset_lat = geo.get_lat_diff / (raster_deg * 2)

      var lat = geo.get_bottom_right.lat + offset_lat
      var lng = geo.get_top_left.lng + offset_lng

      var base_pickup = 'PICKUP_LONG < '+String(lng_st + offset_lng)+' AND PICKUP_LONG > '+String(lng_st - offset_lng)+
        ' AND PICKUP_LAT < '+String(lat_st + offset_lat)+' AND PICKUP_LAT > '+String(lat_st - offset_lat);


      var query_list = [];
      // start in the south of NYC
      while(lat < geo.get_top_left.lat) {
        // start in the west of NYC
        while(lng < geo.get_bottom_right.lng) {
          query_list.push('SELECT COUNT(ID), '+String(lat)+', '+String(lng)+
            ' FROM NYCCAB.TRIP WHERE '+base_pickup+
            ' AND DROPOFF_LONG < '+String(lng + offset_lng)+' AND DROPOFF_LONG > '+String(lng - offset_lng)+
            ' AND DROPOFF_LAT < '+String(lat + offset_lat)+' AND DROPOFF_LAT > '+String(lat - offset_lat));

          // increase longitude for next iteration by one box-size
          lng = lng + 2 * offset_lng
        };
        // increase latitude for next iteration by one box-size
        lat = lat + 2 * offset_lat
        // reset longitude
        lng = geo.get_top_left.lng
      };

      var query = query_list.join(' UNION ALL ');

      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          return console.error('Execute error:', err);
        }
        console.log('Results:', rows);
      });
    });
  },
  get_cluster: function() {
    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      }

      client.exec('SELECT COUNT(TOTAL) FROM NYCCAB.FARE WHERE TOTAL > 0', function (err, rows) {
        client.end();
        if (err) {
          return console.error('Execute error:', err);
        }
        console.log('Results:', rows);
      });
    });
  }

}

module.exports = QueryHandler;