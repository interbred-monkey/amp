// youtube controller

// include the child process
var exec = require('child_process').exec;

//include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

// Load in the moment library
var moment = require('moment');

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
    
    if (body !== "") {
    
      var data = processSearchResults(body);
      return callback(true, "youtube search complete", data);
      
    }
  
  });
  
}

// make the results from the playlists
var processSearchResults = function(yt_res){
  
  // parse the json
  yt_res = JSON.parse(yt_res);

  // no results
  if (!yt_res || _.isUndefined(yt_res.feed) || !_.isArray(yt_res.feed.entry) || yt_res.feed.entry.length === 0) {
    return [];
  }
  
  // pull out the search results
  yt_res = yt_res.feed.entry;

  var ret = [];
  for(y in yt_res){
  
    var duration = moment().startOf('day').add('seconds', yt_res[y].media$group.yt$duration.seconds);
    var time_bits = "";
    (duration.hours() > 0?time_bits += duration.hours()+":":"");
    (duration.minutes() > 0?time_bits += duration.minutes()+":":"");
    (time_bits === ""?time_bits = duration.seconds()+" secs":time_bits += duration.seconds());
    
    var title_bits = yt_res[y].title.$t.split(' - ');
  
    var tmp_ob = {};
    tmp_ob.id = getYouTubeId(yt_res[y].media$group.media$content[0].url);
    tmp_ob.artist = title_bits[0];
    tmp_ob.title = (_.isUndefined(title_bits[1])?"":title_bits[1]);
    tmp_ob.duration = time_bits;
    tmp_ob.link = yt_res[y].media$group.media$content[0].url+"version=3&fs=1&enablejsapi=1&autoplay=0&controls=0&rel=0&showinfo=0&disablekb=1&modestbranding=1";
    tmp_ob.img = yt_res[y].media$group.media$thumbnail[0].url;
    ret.push(tmp_ob);
  }
  
  return ret;
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

var getYouTubeId = function(embed_code) {
   
   // supported urls/embed code
   // <iframe width="640" height="360" src="http://www.youtube.com/embed/2uJqW9O6aW0?feature=player_detailpage" frameborder="0" allowfullscreen></iframe> 
   // <object width="420" height="315"><param name="movie" value="http://www.youtube.com/v/OMw5lwpTBY8?version=3&amp;hl=en_GB&amp;rel=0"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/OMw5lwpTBY8?version=3&amp;hl=en_GB&amp;rel=0" type="application/x-shockwave-flash" width="420" height="315" allowscriptaccess="always" allowfullscreen="true"></embed></object> 
   // http://www.youtube.com/watch?v=OMw5lwpTBY8
   // http://youtu.be/OMw5lwpTBY8
   
  var ret = false;
  var id = false;

  if (embed_code.indexOf("www.youtube.com/embed") != -1) {  
      
    var matches = embed_code.match(/www.youtube.com\/embed\/([a-z0-9-_]+)/gi);
     
     if(matches.length){
        id = matches[0].split("/")[2];
     }
       
  } else if (embed_code.match(/www.youtube.com\/watch/)){
     
     var theurl = url.parse(embed_code,true);
     
     if (theurl.query.v) {
       id = theurl.query.v;
     }  
     
  }  else if(embed_code.match(/youtu.be/)){
     
     var matches = embed_code.match(/youtu.be\/([a-z0-9-_]+)/gi);
     
     if(matches.length){
        id = matches[0].split("/")[1];
     }
     
  }  else if(embed_code.match(/www.youtube.com\/v/)){
     
     var matches = embed_code.match(/www.youtube.com\/v\/([a-z0-9-_]+)/gi);
     
     if(matches.length){
        id = matches[0].split("/")[2];
     }
     
  }
  
  // format the stuff
  if(!id){
    return false;
  }
  
  return id;

}

module.exports = {
  doYouTubeSearch: doYouTubeSearch,
  dlVideo: dlVideo,
  getVideoInfo: getVideoInfo,
  getYouTubeId: getYouTubeId
}