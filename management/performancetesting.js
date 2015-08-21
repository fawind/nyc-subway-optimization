var QueryHandler = require('./../app/queries');

var req = {
  station: { id: '451', lat: 40.7950203326, lng: -73.944249997 },
  box: {
    topLeft: { lat: 40.864695, lng: -74.01976 },
    bottomRight: { lat: 40.621053, lng: -73.779058 } },
  filter: {
    date: [ '2010-01-01T00:00:00.000Z', '2013-12-31T00:00:00.000Z' ],
    years: [ '2010', '2011', '2012', '2013' ] } };

var radius = 700, max = 3000;

function recursive(size) {
  var str = String(size);
  console.time(str);
  QueryHandler.getClusterOutgoing(req.station, req.filter.date, req.filter.years,
    size, req.box)
    .then(function(rows) {
      console.timeEnd(str);
      if (size <= max){ recursive(size+100); }
    })
    .catch(function(err) {
      console.log('[ERROR]', err);
    });
}

recursive(radius);
