// file system controller

// include the config
var config = require('./config/__config.json');

// require the file system library
var fs = require('fs');

// include the async library
var async = require('async');

// require the underscore library
var _ = require('underscore');

// global file structure
var file_structure = {};

// ignore files
var ignore_files = [".DS_Store"];

// allowed file types
var allowed_types = [];

// global file_list
var file_list = [];

// set a list of allowed file types
var setAllowedTypes = function(at) {

  if (!_.isArray(at)) {

    return;

  }

  allowed_types = at;
  return;

}

// find files in a given directory
var findFiles = function(params, callback) {
  
  // load the dir
  fs.readdir(__dirname+"/media/"+params.path, function(err, dir) {

    if (err || (_.isArray(dir) === false && _.isObject === false)) {
      return callback(null, []);
    }

    return callback(null, dir);

  });
  
}

// list files in a given directory
var listFiles = function(params, callback) {

  if (_.isUndefined(file_structure[params.type]) === false) {

    return callback(null, file_structure[params.type]);

  }

  // load the files
  file_structure[params.type] = getFolderFiles(__dirname+"/media/"+params.type);

  return callback(null, file_structure[params.type]);
  
}

var folderFiles = function(path, opts, callback) {

  if (_.isUndefined(callback) && _.isFunction(opts)) {

    callback = opts;
    opts = {
      recursive: true
    }

  }

  var processing = 0,
      files      = [];

  fs.readdir(path, function(err, folder_list) {

    // no files in the folder
    if (_.isArray(folder_list) === false || folder_list.length === 0) {

      return callback(null, []);

    }

    // keep a track of how many files we are processing
    processing = folder_list.length;

    // loop through and make the file structure
    for (var d in folder_list) {

      // dont add the shit files no-one cares about
      if (ignore_files.indexOf(folder_list[d]) !== -1) {

        processing--;

        continue;

      }

      (function(i) {

        fs.stat(path+"/"+folder_list[i], function(err, stats) {

          if (stats.isDirectory() === true && opts.recursive === true) {

            folderFiles(path+"/"+folder_list[i], function(err, data) {

              if (config.debug === true) {

                console.log('called back with '+data.length+' files');

              }

              processing--;

              if (_.isArray(data) && data.length > 0) {

                files = files.concat(data);

              }

              if (config.debug === true) {

                console.log('new files size: '+files.length);

              }


              if (processing === 0) {

                return callback(null, files);

              }
              
            })

          }

          else if (stats.isDirectory() === true) {

            processing--;

            var ob = {
              path: path.replace(__dirname, "")+"/"+folder_list[i]
            }

            files.push(ob);

          }

          else if (stats.isFile() === true) {

            var extension = folder_list[i].split('.');
            extension = extension[extension.length - 1];

            processing--;

            if (allowed_types.length === 0 || allowed_types.indexOf(extension.toLowerCase()) !== -1) {

              var ob = {
                filename: folder_list[i],
                extension: extension,
                path: path.replace(__dirname, "")+"/"+folder_list[i]
              }

              files.push(ob);

            }

          }

          if (processing === 0) {

            return callback(null, files);

          }

        })

      })(d)

    }

  })

}

module.exports = {
  setAllowedTypes: setAllowedTypes,
  findFiles: findFiles,
  listFiles: listFiles,
  folderFiles: folderFiles
}