// last.fm controller

//include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

// Load in the moment library
var moment = require('moment');

// load in the config
var config = require('./config/__config.json');

// Get the youtube video info from the api
var getSimilarArtists = function(params, callback){
  
  if (_.isUndefined(params.artist)) {
    return callback(false, "artist is a required parameter");
  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+params.artist;
  
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
      var lfm_res = JSON.parse(body);
    }
    
    catch (e) {
      return callback(false, "Unable to decode body");
    }

    if (_.isUndefined(lfm_res.similarartists) || !_.isObject(lfm_res.similarartists) || !_.isArray(lfm_res.similarartists.artist) || lfm_res.similarartists.artist.length === 0){
      return callback(false, "No results");
    }

    // return just the artist matches
    var data = lfm_res.similarartists.artist;

    return callback(true, "Similar artists returned", data);
  
  });
  
}

// Get the youtube video info from the api
var getArtistInfo = function(params, callback){
  
  if (_.isUndefined(params.artist)) {
    return callback(false, "artist is a required parameter");
  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+params.artist;
  
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
      var lfm_res = JSON.parse(body);
    }
    
    catch (e) {
      return callback(false, "Unable to decode body");
    }

    if (_.isUndefined(lfm_res.artist) || !_.isObject(lfm_res.artist)){
      return callback(false, "No results");
    }

    // return just the artist matches
    var data = lfm_res.artist;

    // format the data a bit
    data.bio.content = data.bio.content.replace(/\n/g, '<br/>');
    data.bio.content = data.bio.content.replace(/(User-contributed.*)/g, '').trim();

    for (var im in data.image) {

      data.image[im].text = data.image[im]['#text'];
      delete(data.image[im]['#text']);

    }

    return callback(true, "Artist info returned", data);
  
  });
  
}

module.exports = {
  getSimilarArtists: getSimilarArtists,
  getArtistInfo: getArtistInfo
}