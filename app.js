var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./app/routes');

var server = express();

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

/* Static files */
server.use(express.static(__dirname + '/public'));
/* Routes */
server.use('/', routes);

/* 404 error handling */
server.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/* Start app */
var port = 8080;
server.listen(port, function() {
    console.log('Server listening on port ' + port);
});

exports = module.exports = server;
