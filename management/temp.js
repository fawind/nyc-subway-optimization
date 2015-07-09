var qhandler = require('./../app/queries');

qhandler.getAllCluster().then(function(res) {console.log('result:', res)});
