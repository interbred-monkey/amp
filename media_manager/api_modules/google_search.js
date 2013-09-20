// youtube controller

//include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

var searchGoogle = function(params, callback) {

  if (_.isUndefined(params.str)) {
    return callback(false, "str is a required parameter");
  }
  
  var url = "https://www.google.co.uk#q="+params.str+"&safe=off";
  
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

    return callback(true, "search complete", body);

  });

}

module.exports = {
  searchGoogle: searchGoogle 
}