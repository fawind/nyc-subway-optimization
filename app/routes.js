var express = require('express');
var QueryHandler = require('./queries');

var router = express.Router();

router.post('/api/cluster/outgoing', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

  QueryHandler.getClusterOutgoing(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.blockSize, req.body.box)
    .then(function(rows) {
      res.json({ cluster: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: err });
    });
});

router.post('/api/cluster/incoming', function(req, res, next) {
	console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

	QueryHandler.getClusterIncoming(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.blockSize, req.body.box)
    .then(function(rows) {
      res.json({ cluster: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: err });
    });
}),

router.post('/api/analyse', function(req, res, next) {
  console.log('POST request to /api/analyse');

  QueryHandler.getAllEdges(req.body.filter.pathfinding, req.body.filter.countThreshold,
    req.body.distanceThreshold, req.body.filter.valueLimit)
    .then(function(rows) {
      res.json({ edges: rows });
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
      res.status(500).json({ error: err });
    });
}),

module.exports = router;
