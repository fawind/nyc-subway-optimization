var hdb = require('hdb');
var credentials = require('./credentials');

var mainClient = hdb.createClient(credentials);

mainClient.on('error', function(err) {
  console.error('Network connection error', err);
});

var clientPool = {
  getClient: function() {
    var client = hdb.createClient(credentials);

    client.on('error', function(err) {
      console.error('Network connection error', err);
    });

    return client;
  },

  query: function(query, cb, error) {
    mainClient.on('error', function(err) {
      error('Network connection error', err);
      return;
    });

    mainClient.connect(function (err) {
      if (err) {
        error('Network connection error', err);
        return;
      }

      console.log('DB Start Query');

      mainClient.exec(query, function (err, rows) {
        if (err) {
          error('Execute error:', err);
          return;
        }
        console.log('DB Finished Query');
        cb(rows);
      });
    });
  },

  simpleQuery: function(query, cb, error) {
    var client = hdb.createClient(credentials);
    client.on('error', function(err) {
      error('Network connection error', err);
      return;
    });

    client.connect(function (err) {
      if (err) {
        error('Network connection error', err);
        return;
      }

      console.log('DB Start Query');

      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          error('Execute error:', err);
          return;
        }
        console.log('DB Finished Query');
        cb(rows);
      });
    });
  }
};

module.exports = clientPool;
