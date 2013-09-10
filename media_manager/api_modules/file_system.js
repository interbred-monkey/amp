// require the file system library
var fs = require('fs');

// require the underscore library
var _ = require('underscore');

// find files in a given directory
var findFiles = function(params, callback) {
  
  // load the dir
  var dir = fs.readdirSync(__dirname+params.path);
  
}

module.exports = {
  findFiles: findFiles
}
