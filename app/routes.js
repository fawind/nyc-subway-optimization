var express = require('express');
var QueryHandler = require('./queries');

var router = express.Router();

router.post('/api/cluster/outgoing', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

  QueryHandler.getClusterOutgoing(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.filter.time, req.body.blockSize, req.body.box, function(rows) {
  	  res.json({cluster: rows});
  	});
});

router.post('/api/cluster/incoming', function(req, res, next) {
	console.log('POST request to ' + req.url + ' Station: ' + req.body.station.id);

	QueryHandler.getClusterIncoming(req.body.station, req.body.filter.date, req.body.filter.years,
    req.body.filter.time, req.body.blockSize, req.body.box, function(rows) {
      res.json({cluster: rows});
    });
}),

module.exports = router;
