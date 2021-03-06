// handles http requests

// include the file system library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the async library
var async = require('async');

// include our config
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

	  return callback("Favicon, dont load anything");
    
	}
	
  // no path defined back out
  if (_.isUndefined(req.path)) {

    return callback("Not found");

  }

  //Work out the bits of the url
  var url_bits = req.path.split("/");
  url_bits.splice(0,1);
  
  // api calls
  if (url_bits[0] === "api" || url_bits[0] === "ajax") {
  
    // get the request vars etc
    var vars = buildVars(req.params, req.query);
    
    // call the respective function
    delegateAPI(req.path, req.method, vars, function(err, data) {
      
      return callback(err, data);
      
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

        return callback(data);

      }
  
      (config.debug)?console.log("Debug - Serving static content '"+req.path+"'"):"";
    
      var data = {};
      data.file = file;
      data.file_path = '/views/'+file;
      data.path = url_bits;
      data.vars = buildVars(req.params, req.query);
      data.config = {
        directories: config.directories
      }
      callback(null, data);
  
    });
    
  }
  
}

var delegateAPI = function(req_path, req_method, req_vars, callback) {
  
  // do we have some config?
  if (!_.isArray(controller_config) || controller_config.length === 0) {
    return callback({error: "Could not load config"});
  }
  
  // loop the config to see what we should do with the request
  var found_endpoint = false;
  
  for (var cc in controller_config) {

    // malformed config
    if (!_.isObject(controller_config[cc]) || _.isUndefined(controller_config[cc].endpoint) || _.isUndefined(controller_config[cc].method)) {

      continue;

    }

    // match teh endpoint
    var endpoint_match = req_path.match(new RegExp(controller_config[cc].endpoint));
    
    // does it match the config?
    if (!_.isNull(endpoint_match) && controller_config[cc].method.toLowerCase() === req_method.toLowerCase()) {
      
      found_endpoint = true;

      var module = controller_config[cc].module.split('.')[0];

      // make sure the module exists
      if (_.isUndefined(modules[module])) {

        (config.debug)?console.log("Debug - Module "+module+" not found"):"";
        return callback({error: "Not found"});

      }

      // make sure the callback is a function
      if (_.isUndefined(modules[module]) || !_.isFunction(modules[module][controller_config[cc].callback])) {

        (config.debug)?console.log("Debug - Module callback "+controller_config[cc].callback+" not found"):"";
        return callback({error: "Not found"});
      
      }

      // if we have a endpoint param then add that to the request vars
      if (endpoint_match.length > 1) {

        req_vars.endpoint = endpoint_match.slice(1);

      }
      
      // run the function
      modules[module][controller_config[cc].callback].call(undefined, req_vars, function(err, data) {
        
        if (!_.isNull(err)) {

          data = {
            error: err
          }

        }

        return callback(err, data);
        
      });
      
      // break from the loop
      break;
      
    }
    
  }
  
  // couldn't find the endpoint
  if (found_endpoint === false) {

    (config.debug)?console.log("Debug - Endpoint "+req_path.toLowerCase()+" not found"):"";
    return callback ({error: "Endpoint not found"});
  
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
      ret[b] = decodeURIComponent(body[b]);
    }
  }
	
	// add the qs params
	if (_.isObject(qs)) {
    for (var q in qs) {
      ret[q] = decodeURIComponent(qs[q]);
    }
  }
	
	return ret;
}

// self executing function to include the modules and config
var setup = function() {

  var functions = [];
  
  // add in our modules
  functions.push(function(cb) {

    // include all the modules
    fs.readdir(__dirname+'/api_modules/', function(err, files) {
    
      if (err && err.code === "ENOENT") {
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

      cb(null);
    
    });

  });
  
  functions.push(function(cb) {

    // include all the display modules
    fs.readdir(__dirname+'/display_modules/', function(err, files) {
    
      if (err && err.code === "ENOENT") {
        console.log("Unable to read display modules directory");
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

          modules[files[f].split(".")[0]] = require('./display_modules/'+files[f]);
        }
    
      }

      cb(null);
    
    });

  });

  functions.push(function(cb) {

    // load in the controller config
    fs.readdir(__dirname+'/config', function(err, config_files) {
    
      if (err && err.code === "ENOENT") {
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

      cb(null);

    });

  });

  async.parallel(functions, function(err) { });
  
}();

// stuff to export
module.exports = {
	processRequest : processRequest,
  modules: modules
}
