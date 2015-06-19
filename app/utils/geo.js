var GeoUtils = {
  get_top_left: {lng: -74.079760, lat: 40.924695},
  get_bottom_right: {lng: -73.689058, lat: 40.561053},
  get_lng_diff: 0.3907,
  get_lat_diff: 0.36364,
  translate: function(distance_m, bearing, lat, lng){
  	var new_lat = Math.asin(Math.sin(lat) * Math.cos(d/R) +
  		Math.cos(lat) * Math.sin(d/R) * Math.cos(bear));
  	var new_lng = lat + Math.atan2(Math.sin(bear) * Math.sin(d/R) * Math.cos(lat),
  		Math.cos(d/R) - Math.sin(lat) * Math.sin(new_lat));
  	return {
      lat: new_lat,
      lng: new_lng
  	};
  }
};

module.exports = GeoUtils;