var hdb = require('hdb');
var credentials = require('./credentials')

var clientPool = {
  getClient: function() {
    var client = hdb.createClient(credentials);

    client.on('error', function(err) {
      console.error('Network connection error', err);
    });

    return client;
  },
  simpleQuery: function(query, cb) {
    var client = hdb.createClient(credentials);
    client.on('error', function(err) {
      console.error('Network connection error', err);
    });

    client.connect(function (err) {
      if (err) {
        return console.error('Connect error', err);
      }
      
      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          return console.error('Execute error:', err);
        }
        console.log('DB Finished Query');
        cb(rows)
      });
    });
  }
}

module.exports = clientPool;
