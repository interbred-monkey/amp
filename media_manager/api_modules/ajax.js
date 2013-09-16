// Ajax controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the youtube functions
var youtube = require('./youtube.js');

// include the file-system functions
var file_system = require('./file_system.js');

// perform a youtube search
var youtubeSearch = function(params, callback) {
  
  // do a youtube search
  youtube.doYouTubeSearch(params, function(success, msg, data) {

    // did we error
    if (success === false) {
      return callback(success, msg, data);
    }

    var jade_path = __dirname+'/views/search_result_template.jade';

    if (!fs.existsSync(jade_path)) {
      return callback(false, "An error occured reading file");
    }
    
    var _jade = fs.readFileSync(jade_path, {encoding: "utf8"});
    var fn = jade.compile(_jade);
    var html = fn({data: data});
    
    return callback(success, msg, html);
    
  });
  
}

// perform a youtube search
var youtubeVideoInfo = function(params, callback) {
  
  // do a youtube search
  youtube.getYouTubeVideoInfoAPI(params, function(success, msg, data) {

    // did we error
    if (success === false) {
      return callback(success, msg, data);
    }

    var jade_path = __dirname+'/views/video_info_template.jade';

    if (!fs.existsSync(jade_path)) {
      return callback(false, "An error occured reading file");
    }
    
    var _jade = fs.readFileSync(jade_path, {encoding: "utf8"});
    var fn = jade.compile(_jade);
    var html = fn({data: data});
    
    return callback(success, msg, html);
    
  });
  
}

// perform a file system search
var fileSearch = function(params, callback) {
  
  file_system.findFiles(params, function(success, msg, data) {
    callback(success, msg, data);
  });
  
}

module.exports = {
  youtubeSearch: youtubeSearch,
  youtubeVideoInfo: youtubeVideoInfo,
  fileSearch: fileSearch
}
