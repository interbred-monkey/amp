// include the underscore library
var _ = require('underscore');

// include the async library
var async = require('async');

// include the id3_reader library
var id3_reader = require('id3_reader');

// include the file system library
var fs = require('fs');

// include the moment library
var moment = require('moment');

// include the config
var config = require(__dirname+'/config/__config.json');

// inlcude our file system library
var file_system = require(__dirname+'/file_system.js');

// inlcude our lastfm library
var lastfm = require(__dirname+'/lastfm.js');

// inlcude the logs library
var logs = require(__dirname+'/includes/logs.js');

// inlcude the cloudant library
var cloudant = require(__dirname+'/includes/cloudant.js');

// inlcude the lastfm library
var lastfm = require(__dirname+'/lastfm.js');

// define where the music is
var music_folder = config.directories.music;

// ignore files
var ignore_files = [".DS_Store"];

// common types of audio file supported by html5
var allowed_types = ["mp3", "wav", "ogg"];

// keep a log of the errors
var errors = [];

// keep a log of all the tags
var tag_buffer = [];

// how many tags to keep before writing them to the db
var buffer_size = 500;

// are we importing all files and need to replicate the db?
var full_import = false;

// a file store
var file_list = [];

// a count of the number of files to import
var file_count = 0;

// a count of the number of files processed
var processed_count = 0;

var obs = [];

var importFiles = function(file_list, callback) {

  // do we need to import all files?
  if (_.isFunction(file_list) === true) {

    callback = file_list;
    full_import = true;

  }

  var actions = [];

  // find out if the import is already running
  actions.push(function(cb) {

    // check to make sure the queue is empty first
    if (q.length > 0) {

      return cb("Import already running");

    }

    var params = {
      db: "music_copy"
    }

    // check we don't have a copy of the music collection
    cloudant.getdb(params, function(err, data) {

      if (_.isNull(err) || q.length > 0) {

        return cb("Import already running");

      }

      return cb(null);

    })

  })

  // do a full import
  if (full_import === true) {

    actions.push(function(cb) {

      // firstly as this is a big import then we should make a fresh db to import into
      cloudant.createdb({db: 'music_copy'}, function(err, data) {

        if (!_.isNull(err)) {

          return cb('Unable to create import db');

        }

        return cb(null);

      })

    })

    // make sure we have some files in the music dir and then make a list for import
    actions.push(function(cb) {

      fs.readdir(music_folder, function(err, folder_list) {

        if (err) {

          removeMusicCopy(function() {

            return cb("Unable to read music directory");

          })

        }

        else if (folder_list.length > 0) {

          extractFiles(music_folder);

          return cb(null, "Import started");

        }

        else {

          removeMusicCopy(function() {

            return cb(null, "No Music to import");

          })

        }

      })

    })

  }

  // we have been given some files to import -- ignore for now because I have not done this part
  else {

    actions.push(function(cb) {

      if (_.isString(file_list) === true) {

        file_list = [file_list];

      }

      else if (_.isArray(file_list) === false) {

        return cb("No file supplied");

      }

      for (var fl in file_list) {

        // add the file details to the queue
        var fd = getFileDetails(file_list[fl]);

        if (fd === false) {

          continue;

        }

        q.push(fd);

      }

      return cb(null, "Import started");

    })

  }

  async.series(actions, function(err, data) {

    if (!_.isNull(err)) {

      return callback(err);

    }

    else {

      data = _.without(data, null);

      return callback(null, data);

    }

  })

}

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

var q = async.queue(function(file_info, callback) {

  var functions = [];

  if (!_.isObject(file_info)) {

    return callback();

  }

  // make id3 tags
  functions.push(function(cb) {

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

        if (!_.isUndefined(tags['length'])) {

          tags.display_time = formatDisplayTime(tags['length']);

        }

      }

      // change the actual path for a relative path
      tags.path = file_info.path;

      return cb(null, tags);

    });

  })

  /*

  // check for artist artwork
  functions.push(function(tag_data, cb) {

    // is this an unknown artist? We dont wanna look up that
    if (tag_data.artist === "unknown") {

      return cb(null, tag_data);

    }

    var params = {
      artist: tag_data.artist
    }

    lastfm.getArtistInfo(params, function(err, data) {

      if (!_.isNull(err)) {

        return cb(null, tag_data);

      }

      // is this the correct name for the artist?
      if (tag_data.artist !== data.name) {

        tag_data.artist = data.name;

      }

      // have we got an image?
      if (!_.isUndefined(data.image)) {

        tag_data.artist_artwork = data.image[data.image.length - 1].text;

      }
      

      return cb(null, tag_data);

    })

  })

  // check for album artwork
  functions.push(function(tag_data, cb) {

    // is this an unknown artist? We dont wanna look up that
    if (tag_data.artist === "unknown" || tag_data.album === "unknown") {

      return cb(null, tag_data);

    }

    var params = {
      artist: tag_data.artist,
      album: tag_data.album
    }

    lastfm.getAlbumInfo(params, function(err, data) {

      if (!_.isNull(err)) {

        return cb(null, tag_data);

      }

      // is this the correct name for the artist?
      if (tag_data.album !== data.name) {

        tag_data.album = data.name;

      }

      // have we got an image?
      if (!_.isUndefined(data.image)) {

        tag_data.album_artwork = data.image[data.image.length - 1].text;

      }
      

      return cb(null, tag_data);

    })

  })

  // check track info
  functions.push(function(tag_data, cb) {

    // we dont have a tag so we cant really make this functional
    if (tag_data.artist === "unknown") {

      return cb(null, tag_data);

    }

    var params = {
      artist: tag_data.artist,
      track: tag_data.title
    }

    lastfm.getSongInfo(params, function(err, data) {

      if (!_.isNull(err)) {

        return cb(null, tag_data);

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

      return cb(null, tag_data);

    })

  })

  */

  async.waterfall(functions, function(err, data) {

    // increment the number processed
    processed_count++;

    // add it to the list of tags
    tag_buffer.push(data);
    obs.push(data);

    // write the tags...?
    if (tag_buffer.length >= buffer_size) {

      processBuffer();

    }

    setTimeout(function() {

      callback();

    }, 400)

  });
  

}, 10);
 
q.drain = function(err, data) {

  if (err) {

    // add the errors to the log
    //logs.log_errors(err, "music");

    console.log('Import failed, check logs for errors');
    console.log(err);
    return;

  }

  if (processed_count >= file_count) {

    return processBuffer(true);

  }

}

// write the tags to the db
var processBuffer = function(finished) {

  if (tag_buffer.length === 0) {

    return;

  }

  var actions = [];
  
  actions.push(function(cb) {

    var docsToSend = JSON.parse(JSON.stringify(tag_buffer));
    tag_buffer = [];

    var params = {
      db: "music_copy",
      docs: docsToSend
    }

    cloudant.addBulk(params, function(err, data) {

      if (!_.isNull(err)) {

        //tag_buffer = tag_buffer.concat(docsToSend);
        return cb(null);

      }

      return cb(null);

    })

  })
  
  if (full_import === true && finished === true) {

    // remove the current music db
    actions.push(function(cb) {

      console.log('Removing current music DB');

      var params = {
        db: 'music'
      }

      cloudant.destroydb(params, function(err, data) {

        if (!_.isNull(err)) {

          return cb(msg);

        }

        return cb(null);

      })

    })

    // replicate the _music db to music
    actions.push(function(cb) {

      console.log('Duplicating music_copy DB');

      var params = {
        from: 'music_copy',
        to: 'music',
        create_target: true
      }

      cloudant.replicatedb(params, function(err, data) {

        if (!_.isNull(err)) {

          return cb(msg)

        }

        return cb(null);

      })

    })

    // delete the _music db
    actions.push(function(cb) {

      console.log('Removing music_copy DB');

      removeMusicCopy(function(err) {

        return cb(err);

      })

    })

    // add in the view docs
    actions.push(function() {

      console.log('Adding in view docs');

      // put in the view documents
      addViewDocs();

      return cb(null);

    })

  }

  async.series(actions, function(err) {

    if (!_.isNull(err)) {

      console.log("Unable to import music");
      console.log("Error changing music DB");
      console.log(err);
      return;

    }

    if (finished === true) {

      console.log("Import successful");

    }
    
  })

}

// add in the view docs for the new db
var addViewDocs = function() {

  var params = {
    db: 'music_copy',
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

// remove the duplicate music database
var removeMusicCopy = function(callback) {

  var params = {
    db: 'music_copy'
  }

  cloudant.destroydb(params, function(err, data) {

    if (!_.isNull(err)) {

      return callback(msg)

    }

    return callback(null);

  })

}

var formatDisplayTime = function(ts) {

  var display_time = moment(parseInt(ts)).format('HH:mm:ss');

  if (display_time.substr(0, 2) === "00") {

    display_time = display_time.substr(3);

  }

  return display_time;

}

var extractFiles = function(path) {

  // make sure the path supplied exists
  if (fs.statSync(path).isDirectory() === false) {
    return;
  }

  // load the dir
  var dir = fs.readdirSync(path);

  // no files in the folder
  if (_.isArray(dir) === false || dir.length === 0) {
    return;
  }

  // loop through and make the file structure
  for (var d in dir) {

    // dont add the shit files no-one cares about
    if (ignore_files.indexOf(dir[d]) !== -1) {

      continue;

    }

    // it's a file add it to the lower level files
    if (fs.statSync(path+"/"+dir[d]).isFile() === true) {

      var extension = dir[d].split('.');
      extension = extension[extension.length - 1];

      if (allowed_types.indexOf(extension.toLowerCase()) === -1) {

        continue;

      }

      var ob = {
        filename: dir[d],
        extension: extension,
        path: path.replace(__dirname, "")+"/"+dir[d]
      }

      file_count++;
      q.push(ob);

    }

    else if (fs.statSync(path).isDirectory() === true) {

      extractFiles(path+"/"+dir[d]);

    }

  }

}

module.exports = {
  importFiles: importFiles
}