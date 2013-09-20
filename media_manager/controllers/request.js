// handles http requests

var fs = require('fs');
var _ = require('underscore');
var config = require('./config/__config.json');

// modules
var modules = {};

// controller config
var controller_config = [];

// a list of files we dont want to register
var ignore_files = [".DS_Store", "__config.js"];

// handle a request
var processRequest = function(req, callback) {

	// is this a favicon request
	if (req.path === '/favicon.ico') {
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
  if (url_bits[0] === "api" || url_bits[0] === "ajax") {
  
    // get the request vars etc
    var vars = buildVars(req.params, req.query);
    
    // call the respective function
    delegateAPI(req.path, req.method, vars, function(success, msg, data) {
      
      return callback(success, msg, data);
      
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

        var data = {};
        data.file = file;
        data.file_path = "/views/404.jade";

        return callback(false, "Not Found", data);
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

var delegateAPI = function(req_path, req_method, req_vars, callback) {
  
  // do we have some config?
  if (!_.isArray(controller_config) || controller_config.length === 0) {
    return callback(false, "Could not load config");
  }
  
  // loop the config to see what we should do with the request
  var found_endpoint = false;
  
  for (var cc in controller_config) {

    if (!_.isObject(controller_config[cc])) {

      continue;

    }
    
    // does it match the config?
    if (controller_config[cc].endpoint.toLowerCase() === req_path.toLowerCase() && controller_config[cc].method.toLowerCase() === req_method.toLowerCase()) {
      
      found_endpoint = true;
      
      // include the module
      var module = require('./api_modules/'+controller_config[cc].module);

      // make sure the callback is a function
      if (!_.isFunction(module[controller_config[cc].callback])) {

        return callback(false, "Method not found");
      
      }
      
      // run the function
      module[controller_config[cc].callback].call(undefined, req_vars, function(success, msg, data) {
        
        return callback(success, msg, data);
        
      });
      
      // break from the loop
      break;
      
    }
    
  }
  
  // couldn't find the endpoint
  if (found_endpoint === false) {
    return callback (false, "Endpoint not found");
  }
  
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

// self executing function to include the modules and config
var setup = function() {
  
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

        // if it doesn't have an extension then don't include it
        if (files[f].indexOf('.') === -1) {
          continue;
        }

        modules[files[f].split(".")[0]] = require('./api_modules/'+files[f]);
      }
  
    }
  
  });

  // load in the controller config
  fs.readdir(__dirname+'/config', function(err, config_files) {
  
    if (err && err.code !== "ENOENT") {
      console.log("Unable to read config directory");
      process.exit();
    }

    if (_.isArray(config_files) && config_files.length > 0) {
    
      // remove the shit files
      config_files = removeIgnoreFiles(config_files);
    
      for (var cf in config_files) {
    
        var json = fs.readFileSync(__dirname+'/config/'+config_files[cf], {encoding: "utf8"});
        json = JSON.parse(json);
        
        controller_config = controller_config.concat(json);
    
      }
    }

  });
  
}();

// stuff to export
module.exports = {
	processRequest : processRequest,
  modules: modules
}
