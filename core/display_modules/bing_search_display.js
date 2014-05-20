// YouTube Display controller

// include the fs library
var fs = require('fs');

// include the underscore library
var _ = require('underscore');

// include the jade library
var jade = require('jade');

// include the lastfm functions
var bing_search = require('../api_modules/bing_search.js');

var displayBingSearch = function(params, callback) {

  bing_search.doBingSearch(params, function(err, data) {

    // did we error
    if (!_.isNull(err)) {

      return callback(err);

    }

    var jade_path = __dirname+'/views/bing_result_template.jade';

    if (!fs.existsSync(jade_path)) {

      return callback("An error occured reading file");

    }
    
    fs.readFile(jade_path, {encoding: "utf8"}, function(err, _jade) {

      var fn = jade.compile(_jade);
      var html = fn({data: data});
      
      return callback(null, html);

    });

  });

}

module.exports = {
  displayBingSearch: displayBingSearch
}