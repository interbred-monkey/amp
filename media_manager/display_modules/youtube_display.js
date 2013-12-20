// YouTube Display controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the lastfm functions
var youtube = require('../api_modules/youtube.js');

// perform a youtube search
var displayYoutubeSearch = function(params, callback) {
  
  // do a youtube search
  youtube.doYouTubeSearch(params, function(success, msg, data) {

    // did we error
    if (success === false) {

      return callback(success, msg, data);

    }

    var jade_path = __dirname+'/views/autocomplete_result_template.jade';

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

// perform a youtube search
var displayYoutubeVideoInfo = function(params, callback) {
  
  // do a youtube search
  youtube.getYouTubeVideoInfo(params, function(success, msg, data) {

    // did we error
    if (success === false) {

      return callback(success, msg, data);

    }

    var jade_path = __dirname+'/views/video_info_template.jade';

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
  displayYoutubeSearch: displayYoutubeSearch,
  displayYoutubeVideoInfo: displayYoutubeVideoInfo
}