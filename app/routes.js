var express = require('express');
var router = express.Router();
var QueryHandler = require('./queries');

router.post('/api/cluster', function(req, res, next) {
  console.log('POST request to ' + req.url);
  console.log(req.body);
  QueryHandler.get_entry(req.body.lat, req.body.lng, 10);
  res.json()
});

router.post('/api/clusterFiltered', function(req, res, next) {
  console.log('POST request to ' + req.url);
  console.log(req.body);
  res.json()
});

module.exports = router;