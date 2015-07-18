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
function getNextEdge(vertex, edge, distance, start, edges, relational) {
  var posEdges = [];

  for (i = 0; i < edges.length; i++) {
    if (!edges[i].visited) {
      if (geo.getDistance_m(edges[i].lat_in, edges[i].lng_in, vertex.lat, vertex.lng) < distance ||
          geo.getDistance_m(edges[i].lat_out, edges[i].lng_out, vertex.lat, vertex.lng) < distance) {
        posEdges.push(edges[i]);
      }
    }
  }
  console.log(posEdges.length, 'edges possible');
  posEdges = filterByDistance(posEdges, vertex, start);
  console.log(posEdges.length, 'after filtering');
  return posEdges.length > 0 ? maxCounts(posEdges, relational) : null;
}

/**
 * Remove all edges which do not lead away from the startPoint of our current path
 * @param {Array of edges} edges
 * @param {vertex} vertex where we are currently at
 * @param {start} start of the current pathfinding
 * @return {Array of edges} filtered edges
 */
function filterByDistance(edges, vertex, start) {
  var vertexStart = getMidPointVertex(start);
  var vertexDistance = geo.getDistance_m(vertex.lat, vertex.lng, vertexStart.lat, vertexStart.lng);

  for (i = 0; i < edges.length; i++) {
    var vertexCur = getEndpointVertex(edges[i], vertex);
    if (geo.getDistance_m(vertexCur.lat, vertexCur.lng, vertexStart.lat, vertexStart.lng) < vertexDistance) {
      edges.splice(i, 1);
      i--;
    }
  }

  return edges;
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

    var nextEdge;
    var cur = start;
    var curVertex = {lat: cur.lat_in, lng: cur.lng_in};
    // { lat: start.lat_out, lng: start.lng_out },
    var stations = [curVertex];
    // while there are next vertices in range that can be pushed, work with them otherwise one path is finished

    while (nextEdge = getNextEdge(curVertex, cur, looseDistance, start, edges, relational)) {
      cur = nextEdge;
      curVertex = getEndpointVertex(cur, curVertex);
      cur.visited = true;
      stations.push({lat: nextEdge.lat_out, lng: nextEdge.lng_out});
    }
    stations = stations.reverse()

    cur = start;
    curVertex = { lat: start.lat_out, lng: start.lng_out };
    stations.push(curVertex);
    while (nextEdge = getNextEdge(curVertex, cur, looseDistance, start, edges, relational)) {
      cur = nextEdge;
      curVertex = getEndpointVertex(cur, curVertex);
      cur.visited = true;
      stations.push({lat: nextEdge.lat_out, lng: nextEdge.lng_out});
    }
    paths.push({stations: stations});
    console.log(stations);
    /*
    while (nextEdge = getNextEdge({lat: cur.lat_out, lng: cur.lng_out}, cur, looseDistance, start, edges, relational)) {

    }
    */

    cb(paths);
  }
}

module.exports = PathFinder;
