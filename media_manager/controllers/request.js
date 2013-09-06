// handles http requests

var fs = require('fs');
var _ = require('underscore');
var config = require('./config/config.json');

// include all the modules used for processing
var modules = {};

// a list of files we dont want to register
var ignore_files = [".DS_Store"];

// include all the modules
fs.readdir(__dirname+'/api_modules/', function(err,files) {
  
  if (err && err.code !== "ENOENT") {
    console.log("Unable to read modules directory");
    process.exit();
  }
  
  // if we have some results
  if (_.isArray(files) && files.length > 0) {
  
    // remove the shit files
    files = removeIgnoreFiles(files);
  
    // load in the modules directory
    for (var f in files) {
      modules[files[f].split(".")[0]] = require('./api_modules/'+files[f]);
    }
  
  }
  
});

var processRequest = function(req, callback) {
	
	// is this a favicon request
	if (req.path === 'favicon.ico') {
	  return callback(false,"Favicon, dont load anything");
	}
	
  // no path defined back out
  if (_.isUndefined(req.path)) {
    return callback(false, "Not found");
  }

  //Work out the bits of the url
  var url_bits = req.path.split("/");
  url_bits.splice(0,1);
  
  // api calls
  if (url_bits[0] === "api") {
  
    var vars = buildVars(req.params, req.query);
    delegateAPI(req.url, vars, function() {
      return callback();
    });
    
  }
  
  // static html files
  else {
  
    // loading the index
    if (url_bits[0] === "") {
      var file = "index.jade";
      req.path = "/"
    }
    
    // any other file
    else {
      var file = url_bits[0]+".jade";
    }
  
    fs.readFile(__dirname+'/views/'+file, 'utf8', function(err, page) {
    
      if (err) {
        (config.debug)?console.log("Debug - Error reading file '"+file+"'\nError: "+err+""):"";
        return callback(false,"Error reading file");
      }
  
      (config.debug)?console.log("Debug - Serving static content '"+req.path+"'"):"";
    
      var data = {};
      data.file = file;
      data.file_path = '/views/'+file;
      data.path = url_bits;
      data.vars = buildVars(req.params, req.query);
      callback(true,"Success - View Found", data);
  
    });
    
  }
  
}

var delegateAPI = function(req_path, req_vars, callback) {
  
  return callback();
  
}

// works out a list of files removing the ignore files
var removeIgnoreFiles = function(filesArr) {
  
  // no files
  if (!_.isArray(filesArr) || !_.isObject(filesArr)) {
    return filesArr;
  }
  
  // set the return to be either a object or an array
  var returnArr = (_.isObject(filesArr)?{}:[]);
  
  // loopity loop
  for (var fa in filesArr) {
  
    // format the file path to just get the filename
    var fn = filesArr[fa].split('/');
    fn = fn[fn.length-1];
  
    // is the file in the ignore files?
    if (ignore_files.indexOf(fn) === -1) {
      
      // if the files array is an object
      if (_.isObject(filesArr)) {
        returnArr[fa] = filesArr[fa];
      }
      
      // files array is an array
      else if (_.isArray(filesArr)) {
        returnArr.push(filesArr[fa]);
      }
      
    }
    
  }
  
  return returnArr;
  
}

// group the query string and the body together
var buildVars = function(body, qs) {

	var ret = {};

  // do we have some data?
  if (!_.isObject(body) && !_.isObject(qs)) {
    return ret;
  }
	
	// add the body params
	if (_.isObject(body)) {
    for (var b in body) {
      ret[b] = body[b];
    }
  }
	
	// add the qs params
	if (_.isObject(qs)) {
    for (var q in qs) {
      ret[q] = qs[q];
    }
  }
	
	return ret;
}

// stuff to export
module.exports = {
	process : processRequest,
  modules: modules
}