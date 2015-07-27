const refPts = 2;
const cur = 0.3;
const oneOff = 0.2;
const twoOff = 0.15;
const middle = 1;

/**
 * calculate the distance between to spatial points
 * @param {Number} latitude point a
 * @param {Number} longitude point a
 * @param {Number} latitude point b
 * @param {Number} longitude point b
 * @return {Number} distance in meters
 */
function getDistance_m(lat1, lng1, lat2, lng2) {
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
}

/**
 * Helper function for antiAliasePath which cumulates the data around a station
 * and essentially does the antialiasing
 */
function antiAliase(stations) {
  var m = refPts;
  stations[m].lat = stations[m].lat * cur
        + stations[m-1].lat * oneOff + stations[m+1].lat * oneOff
        + stations[m-2].lat * twoOff + stations[m+2].lat * twoOff;
  stations[m].lng = stations[m].lng * cur
        + stations[m-1].lng * oneOff + stations[m+1].lng * oneOff
        + stations[m-2].lng * twoOff + stations[m+2].lng * twoOff;
  return stations[m];
}

/**
 * Helper function for antiAliasePath which cumulates the data around a station which
 * is one point off the end.
 */
function antiAliaseEndpoints(stations) {
  var m = middle;
  stations[m].lat = stations[m].lat * 0.4
        + stations[m-1].lat * 0.3 + stations[m+1].lat * 0.3;
  stations[m].lng = stations[m].lng * 0.4
        + stations[m-1].lng * 0.3 + stations[m+1].lng * 0.3;
  return stations[m];
}

var PathUtils = {
  /**
   * For each point find a point which is more in the overall path by adding surrounded point´s values
   * @param {Array of stations} to be smoothened
   * @return {Array of stations} smoothened
   */
  antiAliasePath: function(stations) {
    // for each point we take 4 other points into account.
    // So we need at least 4 points and the point looked at.
    if (stations.length < (2 * refPts) + 1) return stations;

    var len = stations.length;
    stations[1] = antiAliaseEndpoints(stations.slice(0, 3));
    stations[len-2] = antiAliaseEndpoints(stations.slice(len-3, len));

    for (k = refPts; k < len - refPts; k++) {
      stations[k] = antiAliase(stations.slice(k - refPts, k + refPts + 1));
    }

    return stations;
  },

  /**
   * check for each gap between two stations if another station has to be inserted
   * @param {Array of stations} to be extended
   * @param {Number} max distance between a pair of stations
   * @return {Array of stations} in extended form
   */
  completePath: function(stations, maxDistance) {
    for (n = 1; n < stations.length - 1; n++) {
      if (getDistance_m(stations[n-1].lat, stations[n-1].lng,
          stations[n].lat, stations[n].lng) > maxDistance) {
        var newStation = {
          lat: (stations[n-1].lat * 0.5 + stations[n].lat * 0.5),
          lng: (stations[n-1].lng * 0.5 + stations[n].lng * 0.5)
        }
        stations.splice(n, 0, newStation);
        n--;
      }
    }
    return stations;
  }
};
