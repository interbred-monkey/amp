// Music Manager controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the cloudant library
var cloudant = require('./includes/cloudant.js');

// include the music_import library
var music_import = require('./music_import.js');

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

  cloudant.view(params, function(success, msg, data) {

    // cant get any data
    if (success === false) {

      return callback(false, msg);

    }

    // no errors
    return callback(success, msg, data);

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

  cloudant.view(params, function(success, msg, data) {

     // cant get any data
    if (success === false) {

      return callback(false, msg);

    }

    if (!_.isUndefined(data.rows)) {

      data = data.rows;

    }

    return callback(success, msg, data);

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

var reindex = function(params, callback) {

  music_import.importFiles(function(success, msg) {
  
    callback(success, msg);
  
  });

}

module.exports = {
  getMusicGroup: getMusicGroup,
  getSongList: getSongList,
  reduceGenres: reduceGenres,
  reindex: reindex
}