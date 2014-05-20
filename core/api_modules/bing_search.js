// include the underscore library
var _ = require('underscore');

// Load in the request library
var request = require('request');

// load in the config
var config = require('./config/__config.json');

// search bing
var doBingSearch = function(params, callback) {

  var url = 'https://api.datamarket.azure.com/Bing/Search/Web?$format=json&Market=%27en-GB%27&Query=%27'+encodeURI(params.str)+'%27';

  // set the headers
  var auth = {
    user: config.api_keys.bing,
    pass: config.api_keys.bing
  }

  request.get(url, { auth: auth },
    function(err,response,body){
  
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
      var bing_res = JSON.parse(body);
    }
    
    catch (e) {
      return callback("Unable to decode body");
    }

    if (_.isUndefined(bing_res.d) || _.isUndefined(bing_res.d.results) || bing_res.d.results.length === 0) {
      return callback(null, ["No results"]);
    }

    return callback(null, bing_res.d.results);

  });

}

module.exports = {
  doBingSearch: doBingSearch
}