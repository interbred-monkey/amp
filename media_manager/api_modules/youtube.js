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
var getYouTubeVideoInfo = function(params, callback){

  if (_.isUndefined(params.video_id)) {
    return callback(false, "video_id is a required parameter");
  }
  
  var url = "https://gdata.youtube.com/feeds/api/videos/"+params.video_id+"?v=2&alt=json";
  
  request(url,function(err,response,body){
  
    if (err) {
      return callback(false, "Encountered an error - "+err);
    }
    else if (response.statusCode !== 200) {
      return callback(false, "Received header - "+response.statusCode);
    }
    
    if(body === ""){
      return callback(false, "No data recieved");
    }

    // parse the json
    try {
      var yt_res = JSON.parse(body);
    }
    
    catch (e) {
      return callback(false, "Unable to decode body");
    }

    if (_.isUndefined(yt_res.entry) || !_.isObject(yt_res.entry)){
      return callback(false, "No results");
    }

    var data = getYouTubeParams(yt_res.entry);
    return callback(true, "Video info returned", data);
  
  });
  
}

// search youtube for a video
var doYouTubeSearch = function(params, callback) {

  if (_.isUndefined(params.str)) {
    return callback(false, "str is a required parameter");
  }

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
    
      var data = processYouTubeSearchResults(body);
      return callback(true, "youtube search complete", data);
      
    }
  
  });
  
}

// make the results from the playlists
var processYouTubeSearchResults = function(yt_res){
  
  // parse the json
  try {
    yt_res = JSON.parse(yt_res);
  }
  
  catch (e) {
    return callback(false, "Unable to decode body");
  }

  // no results
  if (!yt_res || _.isUndefined(yt_res.feed) || !_.isArray(yt_res.feed.entry) || yt_res.feed.entry.length === 0) {
    return [];
  }
  
  // pull out the search results
  yt_res = yt_res.feed.entry;

  var ret = [];
  for(y in yt_res){
  
    var yt_ob = getYouTubeParams(yt_res[y]);
    
    ret.push(yt_ob);
  }
  
  return ret;
}

// get the params from the youtube data
var getYouTubeParams = function(data) {

  var duration = moment().startOf('day').add('seconds', data.media$group.yt$duration.seconds);
  var time_bits = "";
  (duration.hours() > 0?time_bits += duration.hours()+":":"");
  (duration.minutes() > 0?time_bits += duration.minutes()+":":"");
  (time_bits === ""?time_bits = duration.seconds()+" secs":time_bits += duration.seconds());
  
  var title_bits = formatTitle(data.title.$t);

  var tmp_ob = {};
  tmp_ob.id = getYouTubeId(data.media$group.media$content[0].url);
  tmp_ob.artist = title_bits.artist;
  tmp_ob.title = (_.isUndefined(title_bits.title)?"":title_bits.title);
  tmp_ob.duration = time_bits;
  tmp_ob.link = data.media$group.media$content[0].url+"version=3&fs=1&enablejsapi=1&autoplay=0&controls=0&rel=0&showinfo=0&disablekb=1&modestbranding=1";
  tmp_ob.img = data.media$group.media$thumbnail[0].url;

  return tmp_ob;

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

var formatTitle = function(title) {

  var stop_words = ['live', 'bestof', 'best of', 'greatest hits', 'hd', 'lyrics', 'hq'];

  var ret = {};
  var bits = [];

  title = title.replace(/([\[\]])/g, '');
  title = title.replace(/([\.\:\"\/])/g, '-');

  if (title.indexOf('-') !== -1) {
 
    title = title.replace(/[^a-z]+([-\s]+)/g, ' - ');

    bits = title.split(' - ');

    bits = _.compact(bits);

    ret.artist = bits[0].trim();
    ret.title = "";

    if (bits.length > 2) {    

      for (var b = 1; b < bits.length; b++) {

        console.log(bits[b], b);

        ret.title += bits[b].trim()+(b !== bits.length-1?' - ':'');

      }

    }

    else {

      ret.title = bits[1].trim();

    }

    var regex = new RegExp(' '+stop_words[sw]+' ', 'gi');

    for (var sw in stop_words) {

      ret.artist = ret.artist.replace(' '+stop_words[sw]+' ', '');

    }

  }

  // there is no way of getting the artist
  else {

    ret.artist = undefined;
    ret.title = title.trim();

  }

  return ret;

}

module.exports = {
  doYouTubeSearch: doYouTubeSearch,
  dlVideo: dlVideo,
  getYouTubeVideoInfo: getYouTubeVideoInfo,
  getYouTubeId: getYouTubeId
}