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

  simpleQuery: function(query, cb, error) {
    mainClient.on('error', function(err) {
      error('Network connection error', err);
      return;
    });

    mainClient.connect(function (err) {
      if (err) {
        error('Network connection error', err);
        return;
      }

      console.log('DB Start Query', query.substring(0, 40), '...');

      mainClient.exec(query, function (err, rows) {
        if (err) {
          mainClient.end();
          error('Execute error:', err);
          return;
        }
        console.log('DB Finished Query', query.substring(0, 40), '...');
        cb(rows);
      });
    });
  },

  query: function(query, cb, error) {
    var client = hdb.createClient(credentials);
    client.on('error', function(err) {
      error('Network connection error on activate', err);
      return;
    });

    client.connect(function (err) {
      if (err) {
        error('Network connection error on connect', err);
        return;
      }

      console.log('DB Start Query', query.substring(0, 40), '...');

      client.exec(query, function (err, rows) {
        client.end();
        if (err) {
          error('Execute error:', err);
          return;
        }
        console.log('DB Finished Query', query.substring(0, 40), '...');
        cb(rows);
      });
    });
  },

  insertBulk: function(insertQuery, bulk, cb, error) {
    var client = hdb.createClient(credentials);
    client.on('error', function(err) {
      error('Network connection error on activate', err);
    });

    client.connect(function(err) {
      if (err) {
        error('Network connection error on connect', err);
      }

      client.prepare(insertQuery, function(err, statement) {
        if(err) {
          return error('Preparation error:', err);
        }

        statement.exec(bulk, function(err, affectedRows) {
          if (err) {
            return error('Execution error:', err);
          }
          cb(affectedRows);
        });

        statement.drop(function(err){
          if (err) {
            return error('Drop error:', err);
          }
        });
      });
    });
  }
};

module.exports = clientPool;
