var hdb = require('hdb/lib');
var credentials = require('./credentials')

hdb.common.MAX_PACKET_SIZE = Math.pow(2, 20);

var client = hdb.createClient(credentials);

client.on('error', function (err) {
  console.error('Network connection error', err);
});

console.log('DB Connection to HANA created');

module.exports = client;