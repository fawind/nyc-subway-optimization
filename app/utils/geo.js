var GeoUtils = {
  // spans area we focus on manhatten area and east till JFK-airport
  getTopLeft: {lng: -74.019760, lat: 40.864695},
  getBottomRight: {lng: -73.779058, lat: 40.621053},

  getLatDiff: 0.243643,
  getLngDiff: 0.240702,

  getLatDiff_m: 27090,
  getLngDiff_m: 20240,

  // return quite accurate value for border of our rectangle
  getLatDiff_m: function() {
    return this.getDistance_m(this.getTopLeft.lat, this.getTopLeft.lng,
      this.getBottomRight.lat,this.getTopLeft.lng)
  },

  getLngDiff_m: function() {
    return this.getDistance_m(this.getTopLeft.lat, this.getTopLeft.lng,
      this.getTopLeft.lat,this.getBottomRight.lng)
  },

  getLatDiff_n: function() {
    return Math.abs(this.getTopLeft.lat - this.getBottomRight.lat)
  },

  getLngDiff_n: function() {
    return Math.abs(this.getTopLeft.lng - this.getBottomRight.lng)
  },

  getDistance_m: function(lat1, lng1, lat2, lng2) {
    var radius = 6371000;

    var phi = this.degToRad(lat1);
    var phi2 = this.degToRad(lat2);
    var deltalat = this.degToRad(lat2-lat1);
    var deltalng = this.degToRad(lng2-lng1);

    var a = Math.sin(deltalat/2) * Math.sin(deltalat/2) +
      Math.cos(phi) * Math.cos(phi2) *
      Math.sin(deltalng/2) * Math.sin(deltalng/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return radius * c;
  },

  degToRad: function(deg) {
    return deg * (Math.PI/180)
  },

  translatePoint: function(distance_m, bearing, lat, lng) {
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