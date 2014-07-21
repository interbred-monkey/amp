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
var music_manager = require('../api_modules/music_manager.js');

/*
var displayArtistInfo = function(params, callback) {

  // get the info from last.fm
  lastfm.getArtistInfo(params, function(err, data) {

    // did we error
    if (!_.isNull(err)) {

      return callback(err);

    }

    // make some artist info
    if (!_.isUndefined(data.name)){

      var jade_path = __dirname+'/views/artist_info_template.jade';

      if (!fs.existsSync(jade_path)) {

        return callback("An error occured reading file");

      }
      
     fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

        var fn = jade.compile(_jade);
        var html = fn({data: data});
        
        return callback(null, html);

      });

    }
    
    return callback(null, html);
    
  });

}

var displaySimilarArtistInfo = function(params, callback) {

  // get the info from last.fm
  lastfm.getSimilarArtists(params, function(err, data) {

    // did we error
    if (!_.isNull(err)) {

      return callback(err);

    }

    var jade_path = __dirname+'/views/similar_artists_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback("An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: data});
      
      return callback(null, html);

    });
    
  });

}

*/

var searchToHTML = function(opts, callback) {

  music_manager.musicSearch(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Error searching music");

    }

    var jade_params = {
      more_docs: (!_.isUndefined(opts.limit) && data.total_rows >= opts.limit?true:false),
      data: data.rows
    }

    var jade_path = __dirname+'/views/'+opts.filename;

    if (!fs.existsSync(jade_path)) {

      return callback("An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn(jade_params);

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data.rows[0].album_artwork)?data.rows[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayMusicArtists = function(params, callback) {

  var opts = {
    artist: params.set,
    limit: 1,
    filename: 'music_artists_template.jade'
  }

  searchToHTML(opts, function(err, data) {

    return callback(err, data);

  })

}

var displayMusicByArtistAlbum = function(params, callback) {

  var opts = {
    reduce: true,
    include_docs: false,
    group_level: 3,
    startkey: [params.set.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
    limit: (_.isUndefined(params.no_limit)?6:200)
  }

  music_manager.getMusicByArtistAlbum(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_artist_album_template.jade';
      
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayMusicByAlbumAndArtist = function(params, callback) {

  var opts = {
    reduce: false,
    include_docs: true,
    startkey: [params.set.replace(/-/g, ' '), params.subset.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' '), params.subset.replace(/-/g, ' ')+"𧻓"]
  }

  music_manager.getMusicByAlbumAndArtist(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_songs_template.jade';
      
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayMusicByArtistSongs = function(params, callback) {

  var opts = {
    reduce: false,
    include_docs: true,
    startkey: [params.set.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' ')+"𧻓"],
    limit: 11
  }

  music_manager.getMusicByArtistSongs(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_artist_songs_template.jade';
      
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayAlbumMusic = function(params, callback) {

  if (!_.isUndefined(params.set) && params.set === "" && !_.isUndefined(params.subset)) {

    params.set = params.subset;
    delete params.subset;
    params.no_limit = true;

    displayMusicByArtistAlbum(params, function(err, data) {

      return callback(err, data);

    })

  }

  else if (!_.isUndefined(params.set) && !_.isUndefined(params.subset)) {

    displayMusicByAlbumAndArtist(params, function(err, data) {

      return callback(err, data);

    })

  }

  else {

    displayMusicByAlbum(params, function(err, data) {

      return callback(err, data);

    })

  }

}

var displayMusicByAlbum = function(params, callback) {

  var opts = {
    reduce: false,
    include_docs: true,
    startkey: [params.set.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' ')+"𧻓"]
  }

  // do we have an artist name to 
  if (!_.isUndefined(params.subset)) {



  }

  music_manager.getMusicByAlbum(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_songs_template.jade';
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayMusicBySong = function(params, callback) {

  var opts = {
    reduce: false,
    include_docs: true,
    startkey: [params.set.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' ')+"𧻓"]
  }

  music_manager.getMusicBySong(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_songs_template.jade';
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayMusicByGenre = function(params, callback) {

  var opts = {
    reduce: false,
    include_docs: true,
    startkey: [params.set.replace(/-/g, ' ')],
    endkey: [params.set.replace(/-/g, ' ')+"𧻓"]
  }

  music_manager.getMusicByGenre(opts, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music from "+params.group+" "+params.set);

    }

    var jade_file = 'music_songs_template.jade';
    var jade_params = {
      set: params.set,
      more_docs: (!_.isUndefined(opts.limit) && data.length >= opts.limit?true:false),
      data: (!_.isUndefined(opts.limit) && data.length >= opts.limit?data.slice(0, opts.limit - 1):data)
    }

    createHTML(jade_file, jade_params, function(err, html) {

      var return_params = {
        html: html, 
        background_image: (!_.isUndefined(data[0].album_artwork)?data[0].album_artwork:"/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    })

  })

}

var displayGroupedList = function(params, callback) {

  var group = params.endpoint[0];
  var regex = new RegExp("("+group[0]+")");
  var view_name = "group"+group.replace(regex, group[0].toUpperCase());

  music_manager.getMusicGroup(view_name, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get "+params.endpoint[0]+" music");

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

      return callback("An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: group_data});

      var return_params = {
        html: html, 
        background_image: "/images/record-full-blue.png"
      }
      
      return callback(null, return_params);

    });

  })

}

var displaySongs = function(params, callback) {

  music_manager.getSongList(params, function(err, data) {

    if (!_.isNull(err)) {

      return callback("Unable to get music list");

    }

    var jade_path = __dirname+'/views/music_songs'+(!_.isUndefined(params.skip)?'_list':'')+'_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback("An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var jade_params = {
        add_anchor: true,
        data: data,
        offset: (!_.isUndefined(params.skip)?params.skip:0)
      }

      var fn = jade.compile(_jade);
      var html = fn(jade_params);

      var return_params = {
        html: html, 
        background_image: ("/images/record-full-blue.png")
      }
      
      return callback(null, return_params);

    });

  })

}

var createHTML = function(filename, data, callback) {

  if (_.isFunction(data)) {

    callback = data;
    data = {};

  }

  var jade_path = __dirname+'/views/'+filename;

  if (!fs.existsSync(jade_path)) {

    return callback("An error occured reading file");

  }
  
  fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

    var fn = jade.compile(_jade);
    var html = fn(data);
    
    return callback(null, html);

  })

}

module.exports = {
  displaySongs: displaySongs,
  //displayArtistInfo: displayArtistInfo,
  //displaySimilarArtistInfo: displaySimilarArtistInfo,
  displayGroupedList: displayGroupedList,
  displayMusicArtists: displayMusicArtists,
  displayMusicByArtistAlbum: displayMusicByArtistAlbum,
  displayMusicByAlbumAndArtist: displayMusicByAlbumAndArtist,
  displayMusicByArtistSongs: displayMusicByArtistSongs,
  displayMusicByAlbum: displayMusicByAlbum,
  displayMusicBySong: displayMusicBySong,
  displayMusicByGenre: displayMusicByGenre,
  displayAlbumMusic: displayAlbumMusic
}