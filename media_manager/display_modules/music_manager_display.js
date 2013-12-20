// Music Manager Display controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the async library
var async = require('async');

// include the lastfm functions
var lastfm = require('../api_modules/lastfm.js');

// include the lastfm functions
var music_manager = require('../api_modules/music_manager.js');

var displayArtistInfo = function(params, callback) {

  // get the info from last.fm
  lastfm.getArtistInfo(params, function(success, msg, data) {

    // did we error
    if (success === false) {

      return callback(success, msg, data);

    }

    // make some artist info
    if (!_.isUndefined(data.name)){

      var jade_path = __dirname+'/views/artist_info_template.jade';

      if (!fs.existsSync(jade_path)) {

        return callback(false, "An error occured reading file");

      }
      
     fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

        var fn = jade.compile(_jade);
        var html = fn({data: data});
        
        return callback(success, msg, html);

      });

    }
    
    return callback(success, msg, html);
    
  });

}

var displaySimilarArtistInfo = function(params, callback) {

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
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: data});
      
      return callback(success, msg, html);

    });
    
  });

}

var displayArtistList = function(cb) {

  var data = music_manager.groupMusic();

  if (data === false) {

    return cb("Unable to get music groups");

  }

  var jade_path = __dirname+'/views/artist_list_template.jade';

  if (!fs.existsSync(jade_path)) {

    return cb("An error occured reading file");

  }
  
  fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

    var fn = jade.compile(_jade);
    var html = fn({data: data.artists});
    
    return cb(null, html);

  });

}

var displaySongList = function(cb) {

  var data = music_manager.getSongList();

  if (data === false) {

    return cb("Unable to get music list, make sure files are indexed");

  }

  var jade_path = __dirname+'/views/song_list_template.jade';

  if (!fs.existsSync(jade_path)) {

    return cb("An error occured reading file");

  }
  
  fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

    var fn = jade.compile(_jade);
    var html = fn({data: data});
    
    return cb(null, html);

  });

}

var displayMusicBrowser = function(params, callback) {

  var functions = {
    artists: displayArtistList,
    songs: displaySongList
  };

  async.series(functions, function(err, data) {

    if (err !== null) {

      return callback(false, err);

    }

    var html = data.artists + data.songs;

    return callback(true, "Display loaded", html)

  });

}

module.exports = {
  displayArtistInfo: displayArtistInfo,
  displaySimilarArtistInfo: displaySimilarArtistInfo,
  displayArtistList: displayArtistList,
  displaySongList: displaySongList,
  displayMusicBrowser: displayMusicBrowser
}