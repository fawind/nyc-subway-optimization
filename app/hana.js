var hdb = require('hdb');
var credentials = require('./credentials')

var clientPool = {
  getClient: function() {
    var client = hdb.createClient(credentials);

    client.on('error', function(err) {
      console.error('Network connection error', err);
    });

    return client;

    /*
    for(var i=0; i<clients.length; i++){
      if(!clients[i].in_use) {
        clients[i].in_use = true;
        return clients[i];
      }
    }

    clients[clients.length] = {
      in_use: true,
      client: hdb.createClient(credentials)
    }

    clients[clients.length-1].client.on('error', function (err) {
      console.error('Network connection error', err);
    });

    return clients[clients.length-1];
    */
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
