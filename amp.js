#!/usr/bin/env node

// media manager api server

// setup the server requires
var express = require('express');
var server = express();
var http = require('http');
var http_server = http.createServer(server);

// get the statup params
var argv = require('optimist').argv;

//include the file system library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include config etc
var config = require('./core/config/__config.json');
var http_request = require('./core/request.js');
var sockets = require('./core/sockets.js');

// include our setup
var setup = require('./core/setup.js');

// before we do anything render the ascii
console.log(fs.readFileSync('./core/includes/startup_art.txt', {encoding: "UTF-8"}));

// setup the things to get the query string and form elements
server.use(express.urlencoded());
server.use(express.multipart());

// setup the render engine
server.set('view engine', 'jade');

// work out 7 days in milliseconds
var seven_days = 60 * 60 * 24 * 7;

// static content folders
var public_folders = ["stylesheets", "javascript", "bootstrap", { name: "images", options: { maxAge: seven_days} }, "fonts", "media"];

// base directory
var base_dir = __dirname+'/core';

// set static content
for (var pf in public_folders) {

  // do we have options for the folder?
  if (_.isObject(public_folders[pf])) {
    server.use('/'+public_folders[pf].name, express.static(base_dir+'/public/'+public_folders[pf].name), public_folders[pf].options);
  }

  // no options just make it public
  else {
    server.use('/'+public_folders[pf], express.static(base_dir+'/public/'+public_folders[pf]));
  }

}

// what should we do with post requests
server.all('*', function(req,res) {

  // get some params for the request
  var rp = {};
  rp.method = req.method;
	rp.path = req._parsedUrl.pathname;
	rp.query = req.query;
	rp.params = req.body;
	
	// handle the request
	http_request.processRequest(rp, function(err, data) {
	
	  // do we have some html to put out?
	  if(!_.isUndefined(data) && data.file){
      res.render(base_dir+data.file_path, {params: data.vars, config: data.config, req: rp});
    }
	
	  // must be an api call
	  else {
      var ret = {"success": (_.isNull(err)?true:false)};
        
      if (!_.isUndefined(data)) {
        ret.data = data;
      }
    
      res.send((_.isNull(err)?200:404), JSON.stringify(ret));
    }
	
    // sever communications
    res.end();
    
	});
	
});

// make the server listen on port
server.listen(8000);

/*    Server Functions    */

var ignorePath = function(path) {
  
  //Work out the bits of the url
  var url_bits = path.split("/");
  url_bits.splice(0,1);
  
  // stop
  if (public_folders.indexOf(url_bits[0]) !== -1) {
    return true;
  }
  
  // carry on
  else {
    return false;
  }
  
}

/*    End Server Functions    */

/*    Socket IO functions   */

// if socket.io is required
var io = (config.require_socket_io?require("socket.io").listen(http_server):false);

//If we need socket.io then load in the functions
if (io) {
	
	//					Socket functions				//
	io.sockets.on('connection',function(socket) {
	
		socket.emit("identify",{});
	
		socket.on('identity',	function(data) { 

		  sockets.identity(data, lib, broadcast_data, send_data); 
      
		});
		
		socket.on('update',	function(data) {

		  sockets.update(data, lib, broadcast_data); 

		});
		
		socket.on('disconnect', function() { 

		  sockets.disconnect({"socketId": socket.id}, lib, broadcast_data);

		});
		
		//Broadcast data
		var broadcastData = function(d) {

			socket.broadcast.emit(d.type,{"data": JSON.stringify(d.data)});

		}
		
		//Send connected socket data
		var sendData = function(d) {

			socket.emit(d.type,{"data": JSON.stringify(d.data)});

		}
		
	});
}

/*    End Socket IO functions   */

/*    Do the setup    */

setup.start();

/*    End setup    */