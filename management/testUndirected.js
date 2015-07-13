var qhandler = require('./../app/queries');

qhandler.getAllEdges()
  .then(function(res) {
    var len = res.length;
    res = qhandler.convertToUndirectedExact(res);
    console.log('size difference of', len - res.length);
  })
  .catch(function(err) {
    console.log(err);
  })
