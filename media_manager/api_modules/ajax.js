// Ajax controller

// include the youtube functions
var youtube = require('./youtube.js');

// include the file-system functions
var file_system = require('./file_system.js');

// perform a youtube search
var youtubeSearch = function(params, callback) {
  
  // do a youtube search
  youtube.doYouTubeSearch(params, function(success, msg, data) {
    
    console.log(success, msg, data);
    
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
  fileSearch: fileSearch
}
