// include the underscore library
var _ = require('underscore');

// include the async library
var async = require('async');

// include the id3_reader library
var id3_reader = require('id3_reader');

// include the file system library
var fs = require('fs');

// inlcude the file system library
var file_system = require(__dirname+'/file_system.js');

// inlcude the file system library
var logs = require(__dirname+'/logs.js');

// define where the music is
var music_folder = "/media/music";

// common types of audio file supported by html5
var allowed_types = ["mp3", "wav", "ogg"];

// keep a log of the errors
var errors = [];

// keep a log of all the tags
var tag_buffer = [];

// what is in the artist artwork folder?
var artist_artwork = [];

// what is in the album artwork folder?
var album_artwork = [];

var importFiles = function(file_list, callback) {

  // do we need to import all files?
  if (_.isFunction(file_list) === true) {

    callback = file_list;

    var folder_list = file_system.getFileList(__dirname+music_folder);

    for (var fl in folder_list) {

      q.push(folder_list[fl]);

    }

    return callback(true, "Import started");

  }

  // we have been given some files to import -- ignore for now because I have not done this part
  else {

    if (_.isString(file_list) === true) {

      file_list = [file_list];

    }

    else if (_.isArray(file_list) === false) {

      return callback(false, "No file supplied");

    }

    for (var fl in file_list) {

      // add the file details to the queue
      var fd = getFileDetails(file_list[fl]);

      if (fd === false) {

        continue;

      }

      q.push(fd);

    }

    return callback(true, "Import started");

  }

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

  // make id3 tags
  functions.push(function(cb) {

    // see if we have some id3 tags
    id3_reader.read(__dirname+file_info.path, function(success, msg, data) {

      // no id3 tags, see if we can get some information from the 
      if (success === false || data.tags.title === "unknown") {

        var tags = makeTagsFromFileName(data.tags, file_info.filename);

      }

      else {

        var tags = data.tags;

      }

      // change the actual path for a relative path
      tags.path = file_info.path;

      return cb(null, tags);

    });

  });

  // check for artist artwork
  functions.push(function(tag_data, cb) {

    // if we dont have a copy of the images dir then load one in
    if (artist_artwork.length === 0) {

      artist_artwork = fs.readdirSync(__dirname+'/../public/images/artwork/artists');

    }

    // is there a copy of this artists image?
    for (var art in artist_artwork) {

      if (artist_artwork[art].match(tag_data.artist.toLowerCase().replace(/\s/g, '_'), 'g')) {

        tag_data.artist_artwork = '/images/artwork/artists/'+artist_artwork[art];

      }

    }

    return cb(null, tag_data);

  });

  // check for album artwork
  functions.push(function(tag_data, cb) {

    if (album_artwork.length === 0) {

      album_artwork = fs.readdirSync(__dirname+'/../public/images/artwork/albums');

    }

    // is there a copy of this artists image?
    for (var aa in album_artwork) {

      if (album_artwork[aa].match(tag_data.album.toLowerCase().replace(/\s/g, '_'), 'g')) {

        tag_data.album_artwork = '/images/artwork/albums/'+album_artwork[aa];

      }

    }

    return cb(null, tag_data);

  });

  async.waterfall(functions, function(err, data) {

    // add it to the list of tags
    tag_buffer.push(data);
    callback();

  });
  

}, 10);
 
q.drain = function(err, data) {

  // write the errors to a file maybe
  fs.writeFile(__dirname+'/media_library/music.json', JSON.stringify(tag_buffer, undefined, 2), function(err) {

    if (!_.isNull(err)) {

      console.log('Error: '+err);

    }

    else {

      if (errors.length) {

        logs.log_errors(errors, 'music');

      }

      // clear out the buffer
      tag_buffer.length = 0;

      console.log('Import Successful');

    }

  });

}

module.exports = {
  importFiles: importFiles
}