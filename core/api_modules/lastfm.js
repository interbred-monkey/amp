// last.fm controller

//include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

// Load in the moment library
var moment = require('moment');

// load in the config
var config = require('./config/__config.json');

// Get similar artist information
var getSimilarArtists = function(params, callback){
  
  if (_.isUndefined(params.artist)) {
    return callback(false, "artist is a required parameter");
  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+encodeURI(params.artist);
  
  doAPICall(url, function(err, data) {

    if (!_.isNull(err)) {

      return callback(false, err);

    }

    if (_.isUndefined(data.artist) || !_.isObject(data.artist)){

      return callback(false, "No results");

    }

    // return just the artist matches
    var data = data.artist;

    data = formatResponse(data);

    return callback(true, "Artist info returned", data);
  
  })
  
}

// Get information about an artist
var getArtistInfo = function(params, callback){
  
  if (_.isUndefined(params.artist)) {
    return callback(false, "artist is a required parameter");
  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+encodeURI(params.artist);
  
  doAPICall(url, function(err, data) {

    if (!_.isNull(err)) {

      return callback(false, err);

    }

    if (_.isUndefined(data.artist) || !_.isObject(data.artist)){

      return callback(false, "No results");

    }

    // return just the artist matches
    var data = data.artist;

    data = formatResponse(data);

    return callback(true, "Artist info returned", data);
  
  })
  
}

// Get album information
var getAlbumInfo = function(params, callback){
  
  if (_.isUndefined(params.artist)) {

    return callback(false, "artist is a required parameter");

  }

  if (_.isUndefined(params.album)) {

    return callback(false, "album is a required parameter");

  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+encodeURI(params.artist)+"&album="+encodeURI(params.album);
  
  doAPICall(url, function(err, data) {

    if (_.isUndefined(data.album) || !_.isObject(data.album)){
      return callback(false, "No results");
    }

    // return just the artist matches
    var data = data.album;

    data = formatResponse(data);

    return callback(true, "Album info returned", data);
  
  });
  
}

// Get information about a song
var getSongInfo = function(params, callback){
  
  if (_.isUndefined(params.artist)) {

    return callback(false, "artist is a required parameter");

  }

  if (_.isUndefined(params.track)) {

    return callback(false, "track is a required parameter");

  }

  var url = "http://ws.audioscrobbler.com/2.0/?method=track.getinfo&api_key="+config.api_keys.lastfm+"&format=json&limit=5&autocorrect=1&artist="+encodeURI(params.artist)+"&track="+encodeURI(params.track);
  
  doAPICall(url, function(err, data) {

    if (_.isUndefined(data.track) || !_.isObject(data.track)){
      return callback(false, "No results");
    }

    // return just the artist matches
    var data = data.track;

    data = formatResponse(data);

    return callback(true, "Track info returned", data);
  
  });
  
}

var doAPICall = function(url, callback) {

  request(url,function(err,response,body){
  
    if (err) {

      return callback("Encountered an error - "+err);

    }

    else if (response.statusCode !== 200) {
      
      return callback("Received header - "+response.statusCode);
    
    }
    
    if(body === ""){

      return callback("No data recieved");

    }

    // parse the json
    try {

      var lfm_res = JSON.parse(body);

    }
    
    catch (e) {

      return callback("Unable to decode body");

    }

    return callback(null, lfm_res);

  })

}

var formatResponse = function(data) {

  // format the data a bit
  if (!_.isUndefined(data.bio)) {

    data.bio.content = data.bio.content.replace(/\n/g, '<br/>');
    data.bio.content = data.bio.content.replace(/(User-contributed.*)/g, '').trim();

  }

  if (!_.isUndefined(data.image)) {

    for (var im in data.image) {

      data.image[im].text = data.image[im]['#text'];
      delete(data.image[im]['#text']);

    }

  }

  if (!_.isUndefined(data.album) && !_.isUndefined(data.album['@attr'])) {

    data.album.attr = data.album['@attr'];
    delete(data.album['@attr']);

  }

  return data;

}

module.exports = {
  getSimilarArtists: getSimilarArtists,
  getArtistInfo: getArtistInfo,
  getAlbumInfo: getAlbumInfo,
  getSongInfo: getSongInfo
}