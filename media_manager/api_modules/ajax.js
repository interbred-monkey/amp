// Ajax controller

// include the youtube functions
var youtube = require('./youtube.js');

// perform a youtube search
var youtubeSearch = function(params, callback) {
  
  // do a youtube search
  youtube.doYouTubeSearch(params, function(success, msg, data) {
    
    console.log(success, msg, data);
    
  });
  
}

module.exports = {
  youtubeSearch: youtubeSearch
}