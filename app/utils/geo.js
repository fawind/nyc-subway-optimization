var GeoUtils = {
  // spans area we focus on manhatten area and east till JFK-airport
  get_top_left: {lng: -74.019760, lat: 40.864695},
  get_bottom_right: {lng: -73.779058, lat: 40.621053},

  get_lat_diff_m: 27090,
  get_lng_diff_m: 20240,

  // return quite accurate value for border of our rectangle
  get_lat_diff_t: function() {
    return this.get_distance_m(this.get_top_left.lat, this.get_top_left.lng,
      this.get_bottom_right.lat,this.get_top_left.lng)
  },

  get_lng_diff_t: function() {
    return this.get_distance_m(this.get_top_left.lat, this.get_top_left.lng,
      this.get_top_left.lat,this.get_bottom_right.lng)
  },

  get_lat_diff: function() {
    return Math.abs(this.get_top_left.lat - this.get_bottom_right.lat)
  },

  get_lng_diff: function() {
    return Math.abs(this.get_top_left.lng - this.get_bottom_right.lng)
  },

  get_distance_m: function(lat1, lng1, lat2, lng2) {
    var radius = 6371000;

    var phi = this.deg_to_rad(lat1);
    var phi2 = this.deg_to_rad(lat2);
    var deltalat = this.deg_to_rad(lat2-lat1);
    var deltalng = this.deg_to_rad(lng2-lng1);

    var a = Math.sin(deltalat/2) * Math.sin(deltalat/2) +
      Math.cos(phi) * Math.cos(phi2) *
      Math.sin(deltalng/2) * Math.sin(deltalng/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return radius * c;
  },

  deg_to_rad: function(deg) {
    return deg * (Math.PI/180)
  },

  translate_point: function(distance_m, bearing, lat, lng) {
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