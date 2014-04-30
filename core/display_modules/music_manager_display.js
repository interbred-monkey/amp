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

var displayGroupedList = function(params, callback) {

  var group = params.endpoint[0];
  var regex = new RegExp("("+group[0]+")");
  var view_name = "group"+group.replace(regex, group[0].toUpperCase());

  music_manager.getMusicGroup(view_name, function(success, msg, data) {

    if (success === false) {

      return callback(false, "Unable to get "+params.endpoint[0]+" music");

    }

    if (params.endpoint[0].toLowerCase() === "genres") {

      data = music_manager.reduceGenres(data);

    }

    var group_data = {
      group: params.endpoint[0],
      group_items: data
    }

    var jade_path = __dirname+'/views/music_group_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback(false, "An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: group_data});

      var return_params = {
        html: html, 
        background_image: "/images/record-full-blue.png"
      }
      
      return callback(true, "html returned", return_params);

    });

  })

}

var displayGroupSubset = function(params, callback) {

  var opts = getSubGroupViewOpts(params);

  music_manager.getMusicGroup(opts.view, opts, function(success, msg, data) {

    if (success === false) {

      return callback(false, "Unable to get music from "+params.group+" "+params.set);

    }

    var jade_path = __dirname+'/views/music_'+opts.file.replace(/-/g, '_')+'_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback(false, "An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var jade_params = {
        set: params.set,
        more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
        data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
      }

      if (!_.isUndefined(opts.group_title)) {

        jade_params.group_title = opts.group_title;

      }

      var fn = jade.compile(_jade);
      var html = fn(jade_params);

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(true, "html returned", return_params);

    });

  })

}

var displaySongs = function(params, callback) {

  music_manager.getSongList(function(success, msg, data) {

    if (success === false) {

      return callback(false, "Unable to get music list");

    }

    var jade_path = __dirname+'/views/music_songs_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback(false, "An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: data});

      var return_params = {
        html: html, 
        background_image: ("/images/record-full-blue.png")
      }
      
      return callback(true, "html returned", return_params);

    });

  })

}

var getSubGroupViewOpts = function(params, opts) {

  switch (params.group) {

    case "artists":
      var view_opts = {
        reduce: false,
        include_docs: true,
        startkey: [params.set.replace(/-/g, ' ')],
        limit: 2,
        view: "groupArtists",
        file: params.group
      }
      break;

    case "artist-album":
      var view_opts = {
        reduce: true,
        startkey: [params.set.replace(/-/g, ' ')],
        endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
        limit: 6,
        group_level: 3,
        view: "groupArtistByAlbum",
        file: params.group
      }
      break;
    
    case "artist-songs":
      var view_opts = {
        reduce: false,
        include_docs: true,
        startkey: [params.set.replace(/-/g, ' ')],
        endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
        limit: 11,
        view: "groupSongsByArtist",
        file: params.group
      }
      break;

    case "albums":
      var view_opts = {
        reduce: false,
        include_docs: true,
        startkey: [params.set.replace(/-/g, ' ')],
        endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
        view: "groupSongs",
        file: "songs",
        group_title: "album"
      }
      break;

    case "songs": 
      var view_opts = {
        reduce: false,
        include_docs: true,
        startkey: [params.set.replace(/-/g, ' ')],
        endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
        view: "groupSongs",
        file: params.group
      }
      break;

    case "genres": 
      var view_opts = {
        reduce: false,
        include_docs: true,
        startkey: [params.set.replace(/-/g, ' ')],
        endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
        view: "groupSongsByGenre",
        file: "songs"
      }
      break;

  }

  return view_opts;

}

module.exports = {
  displayArtistInfo: displayArtistInfo,
  displaySimilarArtistInfo: displaySimilarArtistInfo,
  displayGroupedList: displayGroupedList,
  displayGroupSubset: displayGroupSubset,
  displaySongs: displaySongs
}