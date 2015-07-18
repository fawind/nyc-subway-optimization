var clientPool = require('./hana');
var geo = require('./utils/geo');


/**
 * Searches in the array of edges for the highest weighted edge.
 * relational param adds length to weight in comparison.
 * @param {Array of edges} edges
 * @param {Boolean} relational
 * @return {edge} max
 */
function maxCounts(edges, relational) {
  /
  var max = edges[0],
      coefM = relational ? edgeLength(max) : 1;

  for (i = 0; i < edges.length; i++) {
    var coefC = relational ? edgeLength(edges[i]) : 1;

    if ((edges[i].counts / coefC) > (max.counts / coefM) && !edges[i].visited) {
      coefM = coefC;
      max = edges[i];
    }
  }
  return max;
}

/**
 * Get length of a given edge
 * @param {edge} edge
 * @return {number} length
 */
function edgeLength(edge) {
  return geo.getDistance_m(edge.lat_in, edge.lng_in, edge.lat_out, edge.lng_out);
}

/**
 * Find all edges, that contain a vertice which is in range of distance from the current vertex
 * @param {vertice} vertice (current position in graph)
 * @param {edge} edge (edge of the given vertex)
 * @param {distance} distance (max distance between two vertices)
 * @param {edge} start of the current path
 * @param {Array of edges} edges
 * @return {Array of edges} edges having at least one vertex in range
 */
function getNextEdges(vertice, edge, distance, start, edges) {
  var posEdges = [];

  for (i = 0; i < edges.length; i++) {
    if (!edges[i].visited) {
      if (geo.getDistance_m(edges[i].lat_in, edges[i].lng_in, vertice.lat, vertice.lng) < distance) {
        posEdges.append(edges[i]);
      }
      if (geo.getDistance_m(edges[i].lat_out, edges[i].lng_out, vertice.lat, vertice.lng) < distance) {
        posEdges.append(edges[i]);
      }
    }
  }
  return posEdges;
}

/**
 * Get the rounded midpoint of a given edge (not made for huge edges on spherical object)
 * @param {edge} edge
 * @return {lat: lat, lng: lng} midpoint
 */
function getMidPoint(edge) {
  var lat = (edge.lat_in + edge.lat_out) / 2;
  var lng = (edge.lng_in + edge.lng_out) / 2;
  return {lat: lat, lng: lng};
}

var PathFinder = {
  findBestLine: function(edges, looseDistance, stationDistance, relational, cb) {
    var paths = [];
    // catch possible errors
    if (edges.length == 0) {
      console.log('No edges given');
      cb(paths);
    }

    var start = maxCounts(edges);
    start.visited = true;

    var nextEdgesA, nextEdgesB;
    var cur = start;
    // while there are next vertices in range that can be appended work with them otherwise one path is finished
    while(nextEdgesA = getNextEdges({lat: cur.lat_in, lng: cur.lng_in}, cur, looseDistance, start, edges)
       && nextEdgesB = getNextEdges({lat: cur.lat_out, lng: cur.lng_out}, cur, looseDistance, start, edges)) {

    }

    cb(paths);
  }
}

module.exports = PathFinder;
