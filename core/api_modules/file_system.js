// file system controller

// require the file system library
var fs = require('fs');

// require the underscore library
var _ = require('underscore');

// global file structure
var file_structure = {};

// ignore files
var ignore_files = [".DS_Store"];

// global file_list
var file_list = [];

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

var getFolderFiles = function(path) {

  // make sure the path supplied exists
  if (fs.statSync(path).isDirectory() === false) {
    return false;
  }

  // load the dir
  var dir = fs.readdirSync(path);

  // no files in the folder
  if (_.isArray(dir) === false || dir.length === 0) {
    return [];
  }
  
  var ret_ob = [];

  // loop through and make the file structure
  for (var d in dir) {

    // dont add the shit files no-one cares about
    if (ignore_files.indexOf(dir[d]) !== -1) {

      continue;

    }

    var ob = {};

    // it's a file add it to the lower level files
    if (fs.statSync(path+"/"+dir[d]).isFile() === true) {

      var ext = dir[d].split('.');

      ob.title = dir[d];
      ob.path = (path+"/"+dir[d]).replace(__dirname, "");
      ob.ext = ext[ext.length - 1];

    }

    else if (fs.statSync(path).isDirectory() === true) {

      ob.title = dir[d];
      ob.path = path+"/"+dir[d];
      ob.contents = getFolderFiles(path+"/"+dir[d]);

    }
    
    // add the item back into the return  
    ret_ob.push(ob);

  }

  return ret_ob;

}

var getFileList = function(path) {

  // make sure the path supplied exists
  if (fs.statSync(path).isDirectory() === false) {
    return false;
  }

  // load the dir
  var dir = fs.readdirSync(path);

  // no files in the folder
  if (_.isArray(dir) === false || dir.length === 0) {
    return [];
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

      var ob = {
        filename: dir[d],
        extension: extension,
        path: path.replace(__dirname, "")+"/"+dir[d]
      }

      file_list.push(ob);

    }

    else if (fs.statSync(path).isDirectory() === true) {

      return getFileList(path+"/"+dir[d]);

    }

  }

  return file_list;

}

module.exports = {
  findFiles: findFiles,
  listFiles: listFiles,
  getFileList: getFileList
}