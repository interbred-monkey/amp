// module for displaying file system function output

//include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the file-system functions
var file_system = require('../api_modules/file_system.js');

// perform a file system search
var displayFileSearch = function(params, callback) {
  
  file_system.findFiles(params, function(success, msg, data) {

    callback(success, msg, data);

  });
  
}

// get a directory list
var displayFileList = function(params, callback) {
  
  file_system.listFiles(params, function(success, msg, data) {
    
    // did we error
    if (success === false) {

      return callback(success, msg, data);

    }

    // we have no files
    if (data.length === 0) {

      return callback(success, msg);

    }

    var jade_path = __dirname+'/views/file_list_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback(false, "An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: data});
      
      return callback(success, msg, html);

    });

  });
  
}

module.exports = {
  displayFileSearch: displayFileSearch,
  displayFileList: displayFileList
}