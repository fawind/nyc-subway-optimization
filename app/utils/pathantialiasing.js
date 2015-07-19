const refPts = 2;
const cur = 0.5;
const oneOff = 0.15;
const twoOff = 0.1;

/**
 * For each point find a point which is more in the overall path by adding surrounded point´s values
 * @param {Array of stations} to be smoothened
 * @return {Array of stations} smoothened
 */
function antiAliase(stations) {
  // for each point we take 4 other points into account.
  // So we need at least 4 points and the point looked at.
  if (stations.length < (2 * refPts) + 1) return stations;

  for (k = refPts; k < stations.length - refPts; k++) {
    stations[k].lat = stations[k].lat * cur + stations[k-1].lat * oneOff + stations[k+1].lat * oneOff
          + stations[k-2].lat * twoOff + stations[k+2].lat * twoOff;
    stations[k].lng = stations[k].lng * cur + stations[k-1].lng * oneOff + stations[k+1].lng * oneOff
          + stations[k-2].lng * twoOff + stations[k+2].lng * twoOff;
  }
  return stations;
}

module.exports = antiAliase;
