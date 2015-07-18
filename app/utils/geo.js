// spans MAX area. We focus on manhatten area and east till JFK-airport
const TopLeft = {lng: -74.019760, lat: 40.864695};
const BottomRight = {lng: -73.779058, lat: 40.621053};
const defaultLNG = -74.019760;
const defaultLAT = 40.864695;

var GeoUtils = {
  /**
   * calculate the distance between to spatial points
   * @param {Number} latitude point a
   * @param {Number} longitude point a
   * @param {Number} latitude point b
   * @param {Number} longitude point b
   * @return {Number} distance in meters
   */
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
    return deg * (Math.PI/180);
  },

  /**
   * calculate relative difference for lat-value to add a value in meters
   * @param {Number} latitude of point
   * @param {Number} longitude of point
   * @param {Number} distance between lat-values
   * @return {Number} Lat-diff approximately fitting blockSize_m in spatial
   */
  getLatDiff: function(lat1, lat2, blockSize_m) {
    var d = GeoUtils.getDistance_m(lat1, defaultLNG, lat2, defaultLNG);
    return Math.abs(lat1 - lat2) * (blockSize_m/d);
  },

  /**
   * calculate relative difference for lng-value to add a value in meters
   * @param {Number} latitude of point
   * @param {Number} longitude of point
   * @param {Number} distance between lat-values
   * @return {Number} Lng-diff approximately fitting blockSize_m in spatial
   */
  getLngDiff: function(lng1, lng2, blockSize_m) {
    var d = GeoUtils.getDistance_m(defaultLAT, lng1, defaultLAT, lng2);
    return Math.abs(lng1 -lng2) * (blockSize_m/d);
  }
};

module.exports = GeoUtils;
