// Ajax controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the youtube functions
var youtube = require('./youtube.js');

// perform a youtube search
var youtubeSearch = function(params, callback) {
  
  // do a youtube search
  youtube.doYouTubeSearch(params, function(success, msg, data) {
    
    var _jade = fs.readFileSync(__dirname+'/views/search_result_template.jade', {encoding: "utf8"});
    var fn = jade.compile(_jade);
    var html = fn({data: data});
    
    return callback(success, msg, html);
    
  });
  
}

module.exports = {
  youtubeSearch: youtubeSearch
}