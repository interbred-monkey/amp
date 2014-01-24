// Music Manager controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the music_import library
var music_import = require('./music_import.js');

// a handy store to keep all the music grouped
var music_groups = null;

var getSongList = function() {

  if (!fs.existsSync(__dirname+'/media_library/music.json')) {

    return false;

  }

  // load in the music library
  var library = require('./media_library/music.json');

  return library;

}

var groupMusic = function() {

  // already been populated
  if (!_.isNull(music_groups)) {

    return music_groups;

  }

  // create the structure
  music_groups = {
    artists_grouped: {},
    albums_grouped: {},
    genres_grouped: {},
    artists: {},
    albums: {},
    genres: []
  }

  // load in the song list
  var library = getSongList();

  // error somewhere
  if (library === false) {

    return false;

  }

  for (var l in library) {

    if (_.isUndefined(music_groups.artists[library[l].artist])) {

      music_groups.artists_grouped[library[l].artist] = [];

    }

    if (_.isUndefined(music_groups.albums[library[l].album])) {

      music_groups.albums_grouped[library[l].album] = [];

    }

    if (_.isUndefined(music_groups.genres[library[l].genre])) {

      music_groups.genres_grouped[library[l].genre] = [];

    }

    music_groups.artists_grouped[library[l].artist].push(library[l]);
    music_groups.albums_grouped[library[l].album].push(library[l]);
    music_groups.genres_grouped[library[l].genre].push(library[l]);

    if (_.isUndefined(music_groups.artists[library[l].artist])) {

      music_groups.artists[library[l].artist] = {};
      music_groups.artists[library[l].artist].artwork = (!_.isUndefined(library[l].artist_artwork)?library[l].artist_artwork:"/images/record.png");

    }

    if (_.isUndefined(music_groups.artists[library[l].artist])) {

      music_groups.albums[library[l].album] = {};
      music_groups.albums[library[l].artist].artwork = (!_.isUndefined(library[l].album_artwork)?library[l].album_artwork:"/images/record.png");

    }

    music_groups.genres.push(library[l].genre);

  }

  return music_groups;

}

var reindex = function(params, callback) {

  music_import.importFiles(function(success, msg) {
  
    callback(success, msg);
  
  });

}

module.exports = {
  groupMusic: groupMusic,
  getSongList: getSongList,
  reindex: reindex
}