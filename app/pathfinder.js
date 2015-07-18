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
  var max = edges[0];
  var coefM = relational ? edgeLength(max) : 1;

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
 * Find all edges, that contain a vertex which is in range of distance from the current vertex
 * @param {vertex} vertex (current position in graph)
 * @param {edge} edge (edge of the given vertex)
 * @param {distance} distance (max distance between two vertexs)
 * @param {edge} start of the current path
 * @param {Array of edges} edges
 * @param {Boolean} weighting type
 * @return {Array of edges} edges having at least one vertex in range
 */
function getNextEdges(vertex, edge, distance, start, edges, relational) {
  var posEdges = [];

  for (i = 0; i < edges.length; i++) {
    if (!edges[i].visited) {
      if (geo.getDistance_m(edges[i].lat_in, edges[i].lng_in, vertex.lat, vertex.lng) < distance) {
        edges[i].in = true;
      }
      if (geo.getDistance_m(edges[i].lat_out, edges[i].lng_out, vertex.lat, vertex.lng) < distance) {
        edges[i].out = true;
      }
      if (edges[i].in || edges[i].out) { posEdges.append(edges[i]); }
    }
  }
  posEdges = filterByDistance(posEdges, vertex, start);
  return getOptimalEdge(posEdges, start, vertex, relational);
}

/**
 * Remove all edges which do not lead away from the startPoint of our current path
 * @param {Array of edges} edges
 * @param {vertex} vertex where we are currently at
 * @param {start} start of the current pathfinding
 */
function filterByDistance(edges, vertex, start) {
  var vertexStart = getMidPointVertex(start);
  var vertexDistance = geo.getDistance_m(vertex.lat, vertex.lng, vertexStart.lat, vertexStart.lng);

  for (i = 0; i < edges.length; i++) {
    var vertexCur = getEndpointVertex(edges[i], vertex);
    if (geo.getDistance_m(vertexCur.lat, vertexCur.lng, vertexStart,lat, vertexStart.lng) < vertexDistance)
      edges.splice(i, 1);
  }

  return edges;
}

/**
 * Get edge which is directed away from the start-edge (station) and has the maximum weight
 * @param {Array of edges} edges
 * @param {edge} start of pathfinding
 * @param {vertex} vertex currently looked at
 * @param {Boolean} weighting type
 * @return {edge} optimal edge
 */
function getOptimalEdge(edges, start, vertex, relational) {
  var opti = edges[0];
  var coefM = relational ? edgeLength(opti) : 1;
  var vertexM = getEndpointVertex(opti, vertex);

  for (i = 0; i < edges.length; i++) {
    var coefC = relational ? edgeLength(edges[i]) : 1;
    var vertexC = getEndpointVertex(edges[i], vertex);

    if ((edges[i].counts / coefC) > (opti.counts / coefM) &&
        geo.getDistance_m()) {
      coefM = coefC;
      opti = edges[i];
    }
  }
  return opti;
}

/**
 * Get vertex of an edge which is further away from another given vertex
 * @param {edge} edge to check
 * @param {vertex} reference vertex
 * @return {vertex} vertex of edge with higher distance
 */
function getEndpointVertex(edge, vertex) {
  if (geo.getDistance_m(edge.lat_in, edge.lng_in, vertex.lat, vertex.lng) <
      geo.getDistance_m(edge.lat_out, edge.lng_out, vertex.lat, vertex.lng))
    return { lat: edge.lat_out, lng: edge.lng_out };
  else
    return { lat: edge.lat_in, lng: edge.lng_in };
}

/**
 * Calculate the distance between two vertices and return it
 * @param {vertex} first vertex
 * @param {vertex} second vertex
 * @return {Number} distance
 */
function vertexDistance(vertexA, vertexB) {
  return geo.getDistance_m(vertexA.lat, vertexA.lng, vertexB.lat, vertexB.lng);
}

/**
 * Get vague midpoint of a given edge (not made for huge edges on spherical object)
 * @param {edge} edge
 * @return {lat: lat, lng: lng} midpoint
 */
function getMidPointVertex(edge) {
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
    // while there are next vertexs in range that can be appended work with them otherwise one path is finished
    while(nextEdgesA = getNextEdges({lat: cur.lat_in, lng: cur.lng_in}, cur, looseDistance, start, edges, relational)
       && nextEdgesB = getNextEdges({lat: cur.lat_out, lng: cur.lng_out}, cur, looseDistance, start, edges, relational)) {

    }

    cb(paths);
  }
}

module.exports = PathFinder;
