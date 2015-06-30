var hdb = require('hdb');
var credentials = require('./../app/credentials');

var clienta = hdb.createClient(credentials);

clienta.on('error', function (err) {
  console.error('Network connection error', err);
});

var clientb = hdb.createClient(credentials);

clientb.on('error', function (err) {
  console.error('Network connection error', err);
});


clienta.connect(function (err) {
  if (err) {
    return console.error('Connect error', err);
  }
  clienta.exec('select * from NYCCAB.TRIP WHERE ID < 10', function (err, rows) {
    if (err) {
      clienta.end();
      return console.error('Execute error:', err);
    }
    console.log('Results:', rows);
  });
});

clientb.connect(function (err) {
  if (err) {
    return console.error('Connect error', err);
  }
  clientb.exec('select year(PICKUP_TIME) from NYCCAB.TRIP WHERE ID < 10', function (err, rows) {
    clientb.end();
    if (err) {
      return console.error('Execute error:', err);
    }
    console.log('Results:', rows);
  });
});

return;
