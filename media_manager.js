#!/usr/bin/env node

// mediaMan api server

// requires
var express = require('express');
var server = express();
var http = require('http');
var http_server = http.createServer(server);
var config = require('./media_manager/config/__config.json');
var http_request = require('./media_manager/controllers/request.js');

// setup the body parser
server.use(express.bodyParser());

// setup the render engine
server.set('view engine', 'jade');

// static content folders
var public_folders = ["stylesheets", "javascript", "bootstrap", "images", "fonts"];

// base directory
var base_dir = __dirname+'/media_manager';

// set static content
for (var pf in public_folders) {
  server.use('/'+public_folders[pf], express.static(base_dir+'/public/'+public_folders[pf]));
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
	http_request.processRequest(rp, function(success, msg, data) {
	
		if (success) {
			if(data.file){
				res.render(base_dir+data.file_path, {params: data.vars});
			}
			else{
			  var ret = {"success":success, "msg": msg};
			  
			  if (!_.isUndefined(data)) {
			    ret.data = data;
			  }
			  
			  res.send((success?200:404), JSON.stringify(ret));
			}
		}
		else {
			res.send(404);
		}
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

/*    End Server Functions */

/*    Socket IO functions   */

// if socket.io is required
var io = (config.require_socket_io?require("socket.io").listen(http_server):false);

//If we need socket.io then load in the functions
if (io) {
	
	//					Socket functions				//
	io.sockets.on('connection',function(socket) {
	
		socket.emit("identify",{});
	
		socket.on('identity',	function(data) { 
		  lib.socketio.identity(data, lib, broadcast_data, send_data); 
		});
		
		socket.on('update',	function(data) {
		  lib.socketio.update(data, lib, broadcast_data); 
		});
		
		socket.on('disconnect', function() { 
		  lib.socketio.disconnect({"socketId": socket.id}, lib, broadcast_data);
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