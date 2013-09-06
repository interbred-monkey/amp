// youtube controller

// include the child process
var exec = require('child_process').exec;

//include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

// Get the youtube video info from the api
var getVideoInfo = function(video_id, callback){
  
  var url = "https://gdata.youtube.com/feeds/api/videos/"+video_id+"?v=2&alt=json";
  
  request(url,function(err,response,body){
  
    if(err){
      return callback(false,"Encountered an error - "+err);
    }
    else if(response.statusCode != 200){
      return callback(false,"Received header - "+response.statusCode);
    }
    
    if(body != ""){
    
      var data = getParams(body);
      callback(true,data);
      
    }
  
  });
  
}

// Gets details from the json passed back
var getParams = function(json){
  
  json = JSON.parse(json);
  
  // Most of the video data is - entry->media$group
  var ob = {};
  ob.title = json.entry.media$group.media$title.$t;
  ob.description = json.entry.media$group.media$description.$t;
  
  // put all the thumbnail options in the returning object changing the name
  for(t in json.entry.media$group.media$thumbnail){
    
    switch(json.entry.media$group.media$thumbnail[t].yt$name){
    
      case "sddefault":
        json.entry.media$group.media$thumbnail[t].name = "standard quality video default";
        delete(json.entry.media$group.media$thumbnail[t].yt$name);
        break;
    
      case "mqdefault":
        json.entry.media$group.media$thumbnail[t].name = "medium quality video default";
        delete(json.entry.media$group.media$thumbnail[t].yt$name);
        break;
      
      case "hqdefault":
        json.entry.media$group.media$thumbnail[t].name = "high quality video default";
        delete(json.entry.media$group.media$thumbnail[t].yt$name);
        break;
        
      default:
        json.entry.media$group.media$thumbnail[t].name = json.entry.media$group.media$thumbnail[t].yt$name;
        delete(json.entry.media$group.media$thumbnail[t].yt$name);
        break;
    
    }
    
  }
  
  ob.thumbnail = json.entry.media$group.media$thumbnail;
  
  return ob;
}

// api call for a search
var doYouTubeSearchAPI = function(params, callback) {
  
  // call the actual process
  doYouTubeSearch(params, function(success, msg, data) {
    callback(success, msg, data);
  });
  
}

// search youtube for a video
var doYouTubeSearch = function(params, callback) {

  var str = params.str;

  var url = "http://gdata.youtube.com/feeds/api/videos?max-results=5&alt=json&q="+str;
  
  request(url, function(err, response, body) {
  
    if (err) {
      return callback(false, "Encountered an error - "+err);
    }
    else if (response.statusCode != 200) {
      return callback(false, "Received header - "+response.statusCode);
    }
    
    if (body != "") {
    
      var data = getParams(body);
      return callback(true, "youtube search complete", data);
      
    }
  
  });
  
  return callback(false, "Some message");
  
}

// function to download a yt video
var dlVideo = function(params, callback) {

  // get the video id
  var id = params.video_id;

  // are we missing an id?
  if (_.isUndefined(id)) {
    return callback(false, "video_id is a required parameter");
  }

  // get the video info
  exec ('youtube-dl -f 5 --extract-audio --audio-format mp3 --audio-quality 320K -o "%(title)s.%(ext)s" http://youtu.be/'+id+' --restrict-filenames',function (error, stdout, stderr) {
  
    console.log(stdout);
  
  });
  
}

module.exports = {
  doYouTubeSearch: doYouTubeSearch,
  dlVideo: dlVideo,
  getVideoInfo: getVideoInfo
}