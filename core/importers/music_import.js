// include the underscore library
var _ = require('underscore');

// include the async library
var async = require('async');

// include the MD5 library
var md5 = require('MD5');

// include the event emitter library
var events = require('events');

// include the id3_reader library
var id3_reader = require('id3_reader');

// include the config
var config = require('./config/__config.json');

// include the cloudant module
var cloudant = require('./includes/cloudant.js');

// include the file system module
var file_system = require('./includes/file_system.js');

// include the lastfm module
var lastfm = require('./includes/lastfm.js');

// global params
var emitter       = null,
    doc_buffer    = [],
    delete_buffer = [],
    buffer_size   = 500,
    parallelism   = 1,
    docs_to_pull  = 50
    pull_count    = 0;

// define the allowed file types for import
file_system.setAllowedTypes(['mp3', 'ogg', 'wav']);

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  File process section                                                    */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

// are we running an import?
var importing = false;

var importFiles = function(callback) {

  if (importing === true) {

    return callback('Import already running');

  }

  // update our status
  importing = true;

  var actions = [];

  actions.push(function(cb) {

    file_system.folderFiles(__dirname+'/media/music', function(err, file_list) {

      if (err) {

        return callback('Unable to retieve file list to import');

      }

      cb(null, file_list);
      return callback(null, "Import started");

    })

  })

  actions.push(function(files, cb) {

    async.doUntil(
      function(ducb) {

        var docs_to_write = files.splice(0, 500);

        for (var dtw in docs_to_write) {

          var hash = md5(docs_to_write[dtw].path)

          docs_to_write[dtw] = {
            _id: hash,
            type: "music_import",
            data: docs_to_write[dtw]
          }

        }

        cloudant.addBulk({db: 'queues', docs: docs_to_write}, function(err, data) {

          if (err) {

            if (config.debug === true) {

              console.log("Unable to add to queue: "+err);

            }

            return ducb(null);

          }

          return ducb(null);

        })

      },
      function() {

        return files.length === 0;

      },
      function() {

        return cb(null);

      })

  })

  actions.push(function(cb) {

    startImport(function(err) {

      if (!_.isNull(err)) {

        if (config.debug === true) {
        
          console.log(err);

        }

      }

      return cb(null);

    })

  })

  async.waterfall(actions, function(err, data) {

    if (!_.isNull(err)) {

      console.log(err);

    }

    // finished have we?
    importing = false;

    // must be good.
    console.log('Done');

  })

}

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  End file process section                                                */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  Data process section                                                    */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

var makeTagsFromFileName = function(tag_template, filename) {

  filename_bits = filename.split('.');
  filename_bits = filename_bits.slice(0, (filename_bits.length > 2?filename_bits.length - 2:1));
  filename = filename_bits.join("\s");

  // change some characters
  filename = filename.replace(/_/g, "\s");
  filename = filename.replace(/~/g, "-");

  var bits = filename.split('-');

  // no way of knowing what the tags are sorry
  if (bits.length === 1) {

    tag_template.title = filename;
    return tag_template;

  }

  // we have a few params, lets try and make some tags
  // is this a track number the first/second bit?
  if (bits.length > 2 && (_.isNumber(bits[0]) || _.isNumber(bits[1]))) {

    tag_template.artist = (_.isNumber(bits[0])?bits[1]:bits[0]).trim();
    tag_template.title = bits[2].trim();
    tag_template.track_number = (_.isNumber(bits[0])?bits[0]:bits[1]).trim();

  }

  // we have many bits, who knows what is what, just put it back in the title
  else if (bits.length > 2) {

    tag_template.title = bits.join('-');

  }

  // we must have a decent filename here
  else {

    tag_template.artist = bits[0].trim();
    tag_template.title = bits[1].trim();

  }

  return tag_template;

}

var generateTags = function(file_info, callback) {
  
  // see if we have some id3 tags
  id3_reader.read(file_info.path, function(success, msg, data) {

    // failed to read the tags
    if (success === false) {

      data = {
        tags: {
          artist: "unknown",
          title: "unknown",
          album: "unknown",
          genre: "unknown"
        }
      }

    }

    // no id3 tags, see if we can get some information from the filename
    if (_.isUndefined(data.tags) || data.tags.title === "unknown") {

      var tags = makeTagsFromFileName(data.tags, file_info.filename);

    }

    else {

      var tags = data.tags;

    }

    // change the actual path for a relative path
    tags.path = file_info.path;

    return callback(null, tags);

  });

}

var findArtistArtwork = function(tag_data, callback) {

  // is this an unknown artist? We dont wanna look up that
  if (tag_data.artist === "unknown") {

    return callback(null, tag_data);

  }

  var params = {
    artist: tag_data.artist
  }

  lastfm.getArtistInfo(params, function(err, data) {

    if (!_.isNull(err)) {

      return callback(null, tag_data);

    }

    // is this the correct name for the artist?
    if (tag_data.artist !== data.name) {

      tag_data.artist = data.name;

    }

    // have we got an image?
    if (!_.isUndefined(data.image)) {

      tag_data.artist_artwork = data.image[data.image.length - 1].text;

    }
    

    return callback(null, tag_data);

  })

}

var findAlbumArtwork = function(tag_data, callback) {

  // is this an unknown artist? We dont wanna look up that
  if (tag_data.artist === "unknown" || tag_data.album === "unknown") {

    return callback(null, tag_data);

  }

  var params = {
    artist: tag_data.artist,
    album: tag_data.album
  }

  lastfm.getAlbumInfo(params, function(err, data) {

    if (!_.isNull(err)) {

      return callback(null, tag_data);

    }

    // is this the correct name for the artist?
    if (tag_data.album !== data.name) {

      tag_data.album = data.name;

    }

    // have we got an image?
    if (!_.isUndefined(data.image)) {

      tag_data.album_artwork = data.image[data.image.length - 1].text;

    }
    

    return callback(null, tag_data);

  })

}

var findTrackInfo = function(tag_data, callback) {

  // we dont have a tag so we cant really make this functional
  if (tag_data.artist === "unknown") {

    return callback(null, tag_data);

  }

  var params = {
    artist: tag_data.artist,
    track: tag_data.title
  }

  lastfm.getSongInfo(params, function(err, data) {

    if (!_.isNull(err)) {

      return callback(null, tag_data);

    }

    // do we have a track number?
    if (!_.isUndefined(data.album) && _.isUndefined(tag_data.track_number)) {

      tag_data.track_number = data.album.attr.position;

    }

    // do we have any album artwork?
    if (!_.isUndefined(data.album) && _.isUndefined(tag_data.album_artwork) && !_.isUndefined(data.album.image)) {

      tag_data.album_artwork = data.album.image[data.album.image.length - 1].text;

    }

    // do we have some suggestions we could add?
    tag_data.suggestions = {};

    // suggest a artist name?
    if (!_.isUndefined(data.artist) && data.artist.name.toLowerCase() !== tag_data.artist.toLowerCase()) {

      tag_data.suggestions.artist = data.artist.name;

    }

    // suggest a track name?
    if (data.name.toLowerCase() !== tag_data.title.toLowerCase()) {

      tag_data.suggestions.title = data.name;

    }

    // suggest album info?
    if (!_.isUndefined(data.album)) {

      if (data.album.title.toLowerCase() !== tag_data.album.toLowerCase()) {

        tag_data.suggestions.album = data.album.title;

      }

    }

    return callback(null, tag_data);

  })

}

var startImport = function(callback) {

  if (!_.isNull(emitter)) {

    return callback('Import already running');

  }

  // make the music copy db
  var params = {
    db: "music_copy",
    ignore_err: true
  }

  cloudant.createdb(params, function() {})

  emitter = new events.EventEmitter();
  emitter.once('import_finished', function(err) {

    emitter = null;
    return callback(err);

  })

  processImportQueue();

}

var processImportQueue = function() {

  fetchImportQueueItems(function(err, data) {

    if (!_.isNull(err)) {

      return emitter.emit('import_finished', err);

    }

    if (data.length === 0) {

      writeDocs(true, function() {

        return emitter.emit('import_finished', null);

      })

    }

    for (var d in data) {

      import_q.push(data[d]);

    }

  })

}

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  End data process section                                                */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  Database process section                                                */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

var fetchImportQueueItems = function(callback) {

  var params = {
    db: "queues",
    design_name: "matching",
    view_name: "queueName",
    opts: {
      limit: docs_to_pull,
      skip: doc_buffer.length,
      reduce: false,
      include_docs: true,
      key: "music"
    }
  }

  cloudant.view(params, function(err, data) {

    if (!_.isNull(err)) {

      if (config.debug === true) {

        console.log(err);
        console.log("PULL COUNT ----- "+pull_count+" ------");
        return callback("Unable to get queue data");

      }

    }

    else {

      pull_count++;

    }

    return callback(null, data);

  })

}

var deleteQueueItems = function(callback) {

  var docs_clone = delete_buffer.splice(0, buffer_size);

  // write the docs
  var params = {
    db: "queues",
    docs: docs_clone
  }

  cloudant.addBulk(params, function(err, data) {

    if (!_.isNull(err)) {

      if (config.debug === true) {

        console.log(err);

      }

    }
      
    return callback();

  })

}

var writeMusicItems = function(callback) {

  var docs_clone = doc_buffer.splice(0, buffer_size);

  // write the docs
  var params = {
    db: "music_copy",
    docs: docs_clone
  }

  cloudant.addBulk(params, function(err, data) {

    if (!_.isNull(err)) {

      if (config.debug === true) {

        console.log(err);

      }

      err = "Unable to write docs";

    }

    return callback(err, data);

  })

}

var writeDocs = function(purge, callback) {

  if (_.isFunction(purge)) {

    callback = purge;
    purge = false;

  }

  if (doc_buffer.length < buffer_size && purge === false) {

    return callback(null);

  }

  var actions = [];

  actions.push(function(cb) {

    writeMusicItems(function(err, data) {

      return cb(null);

    })

  })

  actions.push(function(cb) {

    deleteQueueItems(function() {

      return cb(null);

    })

  })

  if (purge === true) {

    actions.push(function(cb) {

      moveImportedDocs(function(err) {

        return cb(err)

      })

    })

  }

  async.series(actions, function(err, data) {

    if (err) {

      return callback(err);

    }

    return callback(null);

  })
  
}

var moveImportedDocs = function(callback) {

  var actions = [];

  // remove the current music db
  actions.push(function(cb) {

    console.log('Removing current music DB');

    var params = {
      db: 'music'
    }

    cloudant.destroydb(params, function(err, data) {

      if (!_.isNull(err)) {

        if (config.debug === true) {

          console.log(err);

        }

        return cb("Unable to remove current music db");

      }

      return cb(null);

    })

  })

  actions.push(function(cb) {

    console.log('Duplicating music_copy DB');

    var params = {
      from: 'music_copy',
      to: 'music',
      create_target: true
    }

    cloudant.replicatedb(params, function(err, data) {

      if (!_.isNull(err)) {

        if (config.debug === true) {

          console.log(err);

        }

        return cb("Unable to replicate db");

      }

      return cb(null);

    })

  })

  // delete the _music db
  actions.push(function(cb) {

    console.log('Removing music_copy DB');

    removeMusicCopy(function(err) {

      if (!_.isNull(err)) {

        if (config.debug === true) {

          console.log(err);

        }

        return cb("Unable to remove music_copy");

      }

      return cb(err);

    })

  })

  // add in the view docs
  actions.push(function(cb) {

    console.log('Adding in view docs');

    // put in the view documents
    addViewDocs();

    return cb(null);

  })

  async.series(actions, function(err) {

    return callback(err);

  })

}

var removeMusicCopy = function() {

  var params = {
    db: "music_copy"
  }

  cloudant.destroydb(params, function(err, data) {

    return callback(err, data);

  })

}

// add in the view docs for the new db
var addViewDocs = function() {

  var params = {
    db: 'music',
    docs: require('./config/db_music.json').documents
  }

  cloudant.addBulk(params, function(err, data) {

    if (!_.isNull(err)) {

      console.log("Unable to add view documents to db "+database, data);
      return;

    }

    else {

      console.log("Added view docs");
      return;

    }

  })

}

//////////////////////////////////////////////////////////////////////////////
/*                                                                          */
/*                                                                          */
/*  End database process section                                            */
/*                                                                          */
/*                                                                          */
//////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////
//                                                 //
//  Processing queue                               //
//                                                 //
/////////////////////////////////////////////////////

var import_q = async.queue(function(doc, callback) {

  var actions = [];

  if (!_.isObject(doc) || _.isUndefined(doc._id)) {

    return callback();

  }

  // make id3 tags
  actions.push(function(cb) {

    generateTags(doc.data, function(err, tags) {

      return cb(err, tags);

    })

  })

  // check for artist artwork
  actions.push(function(tag_data, cb) {

    findArtistArtwork(tag_data, function(err, data) {

      return cb(err, data);

    })

  })

  // check for album artwork
  actions.push(function(tag_data, cb) {

    findAlbumArtwork(tag_data, function(err, data) {

      return cb(err, data);

    })

  })

  // check track info
  actions.push(function(tag_data, cb) {

    findTrackInfo(tag_data, function(err, data) {

      return cb(err, data);

    })

  })

  async.waterfall(actions, function(err, tag_data) {

    // add the new tags to the buffer
    tag_data._id = doc._id;
    doc_buffer.push(tag_data);

    // create our queue doc to delete
    doc = {
      _id: doc._id,
      _rev: doc._rev,
      _deleted: true
    }
    delete_buffer.push(doc);

    return callback(err);

  })

}, parallelism)

import_q.drain = function(err) {

  if (!_.isNull(err)) {

    if (config.debug === true) {

      console.log(">>>>>>>>>>>>>>"+err);

    }

  }

  writeDocs(function() {

    return processImportQueue();

  })
  
}

/////////////////////////////////////////////////////
//                                                 //
//  End processing queue                           //
//                                                 //
/////////////////////////////////////////////////////

module.exports = {
  importFiles: importFiles,
  startImport: startImport
}