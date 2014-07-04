// Music Manager controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the cloudant library
var cloudant = require('./includes/cloudant.js');

// include the music_import library
var music_import = require('./importers/music_import.js');

var getSongList = function(callback) {

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupSongs",
    opts: {
      reduce: false,
      include_docs: true,
      limit: 200
    }
  }

  cloudant.view(params, function(err, data) {

    // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load songs");

    }

    // no errors
    return callback(null, data);

  })

}

var getMusicGroup = function(view, opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: true,
      group_level: 2
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: view,
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load music group");

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByArtist = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: true,
      group_level: 2
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupArtists",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Artists");

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByArtistAlbum = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: true,
      group_level: 2
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupArtistByAlbum",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Artists Album", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByAlbumAndArtist = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: false,
      include_docs: true
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupSongsByAlbumAndArtist",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Album Songs", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByAlbum = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: true,
      group_level: 2
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupAlbums",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Albums", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByArtistSongs = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: true,
      group_level: 2
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupSongsByArtist",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Artist Songs", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicBySong = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: false,
      include_docs: true
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupSongs",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Songs", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var getMusicByGenre = function(opts, callback) {

  if (_.isFunction(opts)) {

    callback = opts;
    opts = {
      reduce: false,
      include_docs: true
    }

  }

  var params = {
    db: "music",
    design_name: "matching",
    view_name: "groupSongsByGenre",
    opts: opts
  }

  cloudant.view(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to load Genre", null);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(null, data);

  })

}

var reduceGenres = function(d) {

  var rd = [];
  var k2r = [];

  for (var k in d) {

    if (rd.indexOf(d[k].key[0]) === -1) {

      rd.push(d[k].key[0]);

    }

    else {

      k2r.push(k);

    }

  }

  for (var r in k2r) {

    d.splice(k2r[r]);

  }

  return d;

}

var musicSearch = function(opts, callback) {

  if (_.isUndefined(opts.artist) && _.isUndefined(opts.album) && _.isUndefined(opts.title) && _.isUndefined(opts.genre)) {

    return callback("A searchable subset is required");

  }

  var params = {
    db: "music",
    design_name: "search",
    search_name: "music",
    opts: {
      include_docs: true,
      q: ""
    }
  }

  if (!_.isUndefined(opts.limit)) {

    params.limit = opts.limit;

  }

  var query_bits = [];

  if (!_.isUndefined(opts.artist)) {

    query_bits.push("(artist: "+opts.artist+(opts.fuzzy === true?"*":"")+")");

  }

  if (!_.isUndefined(opts.album)) {

    query_bits.push("(album: "+opts.album+(opts.fuzzy === true?"*":"")+")");

  }

  if (!_.isUndefined(opts.title)) {

    query_bits.push("(title: "+opts.title+(opts.fuzzy === true?"*":"")+")");

  }

  if (!_.isUndefined(opts.genre)) {

    query_bits.push("(genre: "+opts.genre+(opts.fuzzy === true?"*":"")+")");

  }

  params.opts.q = query_bits.join((opts.fuzzy?" OR ":" AND "));

  cloudant.search(params, function(err, data) {

     // cant get any data
    if (!_.isNull(err)) {

      return callback("Unable to return music");

    }

    return callback(null, data);

  })

}

var reindex = function(params, callback) {

  music_import.importFiles(function(err, data) {
  
    callback(err, data);
  
  });

}

module.exports = {
  getMusicGroup: getMusicGroup,
  getSongList: getSongList,
  getMusicByArtist: getMusicByArtist,
  getMusicByArtistAlbum: getMusicByArtistAlbum,
  getMusicByAlbumAndArtist: getMusicByAlbumAndArtist,
  getMusicByAlbum: getMusicByAlbum,
  getMusicByArtistSongs: getMusicByArtistSongs,
  getMusicBySong: getMusicBySong,
  getMusicByGenre: getMusicByGenre,
  reduceGenres: reduceGenres,
  musicSearch: musicSearch,
  reindex: reindex
}