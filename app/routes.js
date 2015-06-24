var express = require('express');
var QueryHandler = require('./queries');

var router = express.Router();

router.post('/api/cluster', function(req, res, next) {
  console.log('POST request to ' + req.url + ' Station: ' + req.body.id);

  QueryHandler.get_cluster_filtered(req.body.lat, req.body.lng, req.body.filter.date[0], 
  	req.body.filter.date[1], req.body.filter.years, req.body.filter.time, 10, function(rows) {
  	  res.json({cluster: rows, raster:10});
  	});
  
  /*
  QueryHandler.get_cluster(req.body.lat, req.body.lng, 10, function(rows) {
  	res.json({cluster: rows, raster: 10});
  });*/
});

router.post('/api/clusterFiltered', function(req, res, next) {
  console.log('POST request to ' + req.url);

  QueryHandler.get_cluster_filtered(req.body.lat, req.body.lng, req.body.filter.date[0], 
  	req.body.filter.date[1], req.body.filter.years, req.body.filter.time, 10, function(rows) {
  	  res.json({cluster: rows, raster:10});
  	});
});

module.exports = router;
