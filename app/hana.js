var hdb = require('hdb');
var credentials = require('./credentials');

var client = hdb.createClient(credentials);

client.on('error', function (err) {
  console.error('Network connection error', err);
});

console.log('DB Connection to HANA created');

module.exports = client;
