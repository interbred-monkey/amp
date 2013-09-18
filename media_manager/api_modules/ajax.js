// Ajax controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the youtube functions
var youtube = require('./youtube.js');

// include the lastfm functions
var lastfm = require('./lastfm.js');

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
  youtube.getYouTubeVideoInfo(params, function(success, msg, data) {

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

var getArtistInfo = function(params, callback) {

  // get the info from last.fm
  lastfm.getArtistInfo(params, function(success, msg, data) {

    // did we error
    if (success === false) {
      return callback(success, msg, data);
    }

    var html = {};
    html.similar_artists = false;
    html.artist_info = false;

    // make some similar artist html
    if (!_.isUndefined(data.artist) && !_.isUndefined(data.artist.similar)){
      
      var jade_path = __dirname+'/views/similar_artists_template.jade';

      if (!fs.existsSync(jade_path)) {
        return callback(false, "An error occured reading file");
      }
      
      var _jade = fs.readFileSync(jade_path, {encoding: "utf8"});
      var fn = jade.compile(_jade);
      html.similar_artists = fn({data: data.artist.similar.artist});

    }

    // make some artist info
    if (!_.isUndefined(data.artist) && !_.isUndefined(data.artist.similar)){

      var jade_path = __dirname+'/views/artist_info_template.jade';

      if (!fs.existsSync(jade_path)) {
        return callback(false, "An error occured reading file");
      }
      
      var _jade = fs.readFileSync(jade_path, {encoding: "utf8"});
      var fn = jade.compile(_jade);
      html.artist_info = fn({data: data});

    }
    
    return callback(success, msg, html);
    
  });

}

var getSimilarArtistInfo = function(params, callback) {

  // get the info from last.fm
  lastfm.getSimilarArtists(params, function(success, msg, data) {

    // did we error
    if (success === false) {
      return callback(success, msg, data);
    }

    var jade_path = __dirname+'/views/similar_artists_template.jade';

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
  fileSearch: fileSearch,
  getSimilarArtistInfo: getSimilarArtistInfo,
  getArtistInfo: getArtistInfo
}
