var express = require('express');
var QueryHandler = require('./queries');
var PathFinder = require('./pathfinder');

var router = express.Router();

var errorMsg = 'Internal server error';

router.post('/api/cluster/outgoing', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

  QueryHandler.getClusterOutgoing(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.radius, req.body.box)
    .then(function(rows) {
      res.json({ cluster: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: errorMsg });
    });
});

router.post('/api/cluster/incoming', function(req, res, next) {
	console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

	QueryHandler.getClusterIncoming(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.radius, req.body.box)
    .then(function(rows) {
      res.json({ cluster: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: errorMsg });
    });
});

router.post('/api/cluster/outgoing/raw', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

  QueryHandler.getPointsOutgoing(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.radius, req.body.box)
    .then(function(rows) {
      res.json({ points: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: errorMsg });
    });
});

router.post('/api/cluster/incoming/raw', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

  QueryHandler.getPointsIncoming(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.radius, req.body.box)
    .then(function(rows) {
      res.json({ points: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: errorMsg });
    });
});

router.post('/api/analyse', function(req, res, next) {
  console.log('POST request to /api/analyse');

  QueryHandler.getEdges(req.body.box, req.body.filter.filterEdges, req.body.filter.countThreshold,
    req.body.filter.distanceThreshold, req.body.filter.valueLimit)
    .then(function(rows) {
      res.json({ edges: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: errorMsg });
    });
});

router.post('/api/analyse/stations', function(req, res, next) {
  console.log('POST request to /api/analyse/stations');

  PathFinder.getOptimizedLines(req.body.edges, req.body.filter.looseEndsDistance,
    req.body.filter.relational, req.body.filter.newLines,
    function(stations) {
      res.json(stations);
    });
});

module.exports = router;
