var client = require('./hana');
var geo = require('./utils/geo');

var QueryHandler = {
  get_cluster: function(lat_st, lng_st, raster_deg, cb) {
    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      }

      var offset_lng = geo.get_lng_diff / (raster_deg * 2);
      var offset_lat = geo.get_lat_diff / (raster_deg * 2);

      var lat = geo.get_bottom_right.lat + offset_lat;
      var lng = geo.get_top_left.lng + offset_lng;

      var base_pickup = 'PICKUP_LONG < ' + String(lng_st + offset_lng) + ' AND PICKUP_LONG > ' + String(lng_st - offset_lng) +
        ' AND PICKUP_LAT < ' + String(lat_st + offset_lat) + ' AND PICKUP_LAT > ' + String(lat_st - offset_lat);


      var query_list = [];
      // start in the south of NYC
      while (lat < geo.get_top_left.lat) {
        // start in the west of NYC
        while (lng < geo.get_bottom_right.lng) {
          query_list.push('SELECT COUNT(ID) AS "count", ' + String(lat)+' as "lat", ' + String(lng) + 'as "lng"' +
            ' FROM NYCCAB.TRIP WHERE '+base_pickup+
            ' AND DROPOFF_LONG < ' + String(lng + offset_lng) + ' AND DROPOFF_LONG > ' + String(lng - offset_lng) +
            ' AND DROPOFF_LAT < ' + String(lat + offset_lat) + ' AND DROPOFF_LAT > ' + String(lat - offset_lat));

          // increase longitude for next iteration by one box-size
          lng = lng + 2 * offset_lng;
        }
        // increase latitude for next iteration by one box-size
        lat = lat + 2 * offset_lat;
        // reset longitude
        lng = geo.get_top_left.lngp;
      }

      var query = query_list.join(' UNION ALL ');

      console.log('DB Start Query');

      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          return console.error('Execute error:', err);
        }
        console.log('DB Finished Query');
        cb(rows);
      });
    });
  },

  get_cluster_filtered: function(lat_st, lng_st, raster_deg, cb) {
    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      }

      var offset_lng = geo.get_lng_diff / (raster_deg * 2);
      var offset_lat = geo.get_lat_diff / (raster_deg * 2);

      var lat = geo.get_bottom_right.lat + offset_lat;
      var lng = geo.get_top_left.lng + offset_lng;

      var base_pickup = 'PICKUP_LONG < ' + String(lng_st + offset_lng)+' AND PICKUP_LONG > ' + String(lng_st - offset_lng) +
        ' AND PICKUP_LAT < ' + String(lat_st + offset_lat) + ' AND PICKUP_LAT > ' + String(lat_st - offset_lat);


      var query_list = [];
      // start in the south of NYC
      while (lat < geo.get_top_left.lat) {
        // start in the west of NYC
        while (lng < geo.get_bottom_right.lng) {
          query_list.push('SELECT COUNT(ID) AS "count", ' + String(lat) + ' as "lat", ' + String(lng) + 'as "lng"' +
            ' FROM NYCCAB.TRIP WHERE ' + base_pickup +
            ' AND DROPOFF_LONG < ' + String(lng + offset_lng) + ' AND DROPOFF_LONG > ' + String(lng - offset_lng) +
            ' AND DROPOFF_LAT < ' + String(lat + offset_lat) + ' AND DROPOFF_LAT > ' + String(lat - offset_lat));

          // increase longitude for next iteration by one box-size
          lng = lng + 2 * offset_lng;
        }
        // increase latitude for next iteration by one box-size
        lat = lat + 2 * offset_lat;
        // reset longitude
        lng = geo.get_top_left.lng;
      }

      var query = query_list.join(' UNION ALL ');

      console.log('DB Start Query');

      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          return console.error('Execute error:', err);
        }
        console.log('DB Finished Query');
        cb(rows);
      });
    });
  }
};

module.exports = QueryHandler;
