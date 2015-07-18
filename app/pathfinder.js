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
  var max = edges[0]
  for (j = 0; j < edges.length; j++) {
    if (!edges[j].visited)
      max = edges[j];
  }
  var coefM = relational ? edgeLength(max) : 1;

  for (i = 0; i < edges.length; i++) {
    var coefC = relational ? edgeLength(edges[i]) : 1;

    if ((edges[i].counts / coefC) > (max.counts / coefM) && !edges[i].visited) {
      coefM = coefC;
      max = edges[i];
    }
  }
  if (max.visited)
    return null;
  else
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
  posEdges = filterByDistance(posEdges, vertex, start);
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
 * The exact opposite of getEndpointVertex above
 * @param {edge} edge to check
 * @param {vertex} reference vertex
 * @return {vertex} vertex of edge with higher distance
 */
function getStartpointVertex(edge, vertex) {
  if (geo.getDistance_m(edge.lat_in, edge.lng_in, vertex.lat, vertex.lng) <
      geo.getDistance_m(edge.lat_out, edge.lng_out, vertex.lat, vertex.lng))
    return { lat: edge.lat_in, lng: edge.lng_in };
  else
    return { lat: edge.lat_out, lng: edge.lng_out };
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
  /**
   * Handles request defined in routes and returns possible new subway lines on given edges
   * @param {Array of edges} to optimize on
   * @param {Number} max distance to merge nodes (when transforming into graph)
   * @param {Boolean} base weight also on edges length
   * @param {lines} number of new subway lines wanted
   * @param {callback} taking the result as only argument
   * @return via callback(paths)
   */
  getOptimizedLines: function(edges, looseDistance, relational, lines, cb) {
    var paths = [];
    // catch possible errors
    if (edges.length == 0) {
      console.log('No edges given');
      cb(paths);
    }

    for (l = 0; l < lines; l++) {
      paths.push({ stations: PathFinder.findBestLine(edges, looseDistance, relational)});
    }

    cb(paths);
  },

  /**
   * Calculates the ideal lines based on the edges and their prior use
   * @param All parameters based on getOptimizedLines above.
   * @return {stations} list of vertices (stations) forming the new line
   */
  findBestLine: function(edges, looseDistance, relational) {
    var start = maxCounts(edges);
    if (!start) return [];
    start.visited = true;

    var nextEdge;
    var cur = start;
    var curVertex = {lat: cur.lat_in, lng: cur.lng_in};
    var stations = [curVertex];

    while (nextEdge = getNextEdge(curVertex, cur, looseDistance, start, edges, relational)) {
      //stations.push(getStartpointVertex(nextEdge, curVertex));
      stations.push(getEndpointVertex(nextEdge, curVertex));

      nextEdge.visited = true;
      cur = nextEdge;
      curVertex = getEndpointVertex(cur, curVertex);
    }
    stations = stations.reverse()

    cur = start;
    curVertex = { lat: start.lat_out, lng: start.lng_out };
    stations.push(curVertex);
    while (nextEdge = getNextEdge(curVertex, cur, looseDistance, start, edges, relational)) {
      //stations.push(getStartpointVertex(nextEdge, curVertex));
      stations.push(getEndpointVertex(nextEdge, curVertex));

      nextEdge.visited = true;
      cur = nextEdge;
      curVertex = getEndpointVertex(cur, curVertex);
    }

    return stations;
  }
}

module.exports = PathFinder;
