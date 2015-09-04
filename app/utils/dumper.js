var fs = require('fs');
var Promise = require('bluebird');

function dumpToFile(filename, requestJSON, responseJSON) {
  return new Promise(function(resolve, reject) {
    console.log('add to file');
    fs.appendFile(filename, JSON.stringify(requestJSON) + '|||' + JSON.stringify(responseJSON) + '\n', function (err) {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
}

module.exports = {dumpToFile: dumpToFile};
