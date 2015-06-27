var express = require('express');
var QueryHandler = require('./queries');

var router = express.Router();

router.post('/api/cluster', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.id);

  QueryHandler.getClusterOutgoing({lat: req.body.lat, lng: req.body.lng}, {from: req.body.filter.date[0], 
  	to: req.body.filter.date[1]}, req.body.filter.years, req.body.filter.time, 2000, {topLeft: {lng: -74.019760, lat: 40.864695}, 
  	bottomRight: {lng: -73.779058, lat: 40.621053}}, function(rows) {
  	  res.json({cluster: rows, raster:10});
  	});
});

router.post('/api/cluster/incoming', function(req, res, next) {
	console.log('POST request to ' + req.url + ' Station: ' + req.body.id);
}),

module.exports = router;
