// express for serving statics and coping with requests
var express = require('express');
var bodyParser = require('body-parser');
// routes for our app on index
var routes = require('./app/routes');

var server = express();

// Static directory and post-routing for app
server.use(express.static(__dirname + '/public'));
// for parsing json in req-body
server.use(bodyParser.json()); 
server.use(bodyParser.urlencoded({ extended: true })); 
server.use('/', routes);

// 404 error handling
server.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
 
var port = 8080;

server.listen(port, function() {
    console.log('server listening on port ' + port);
});