// calculate the api url
var cloudant_url = "https://interbredmonkey:guw2mf8r@interbredmonkey.cloudant.com:443";

// include the nano library
var nano = require('nano')(cloudant_url);

// include the async library
var async = require('async');

var mc = nano.db.use('music_copy');

var docs = require('./music.json');

var actions = [];

actions.push(function(cb) {

  var dts = docs.splice(0, 500);
  console.log(docs.length);

  mc.bulk({"docs": dts}, function(err, data) {

    //console.log(err, docs);
    return cb(null);

  })

})

actions.push(function(cb) {

  var dts = docs.splice(0, 500);
  console.log(docs.length);

  mc.bulk({"docs": dts}, function(err, data) {

    //console.log(err, docs);
    return cb(null);

  })

})

actions.push(function(cb) {

  var dts = docs.splice(0, 400);
  console.log(docs.length);

  mc.bulk({"docs": dts}, function(err, data) {

    //console.log(err, docs);
    return cb(null);

  })

})

/*
actions.push(function(cb) {

  for (var i = 0; i < docs.length; i++) {

    q.push(docs[i]);

  }

  return cb(null);

})
*/

async.series(actions, function(err) {



})

var q = async.queue(function(doc, cb) {

  mc.bulk({"docs": [doc]}, function(err, docs) {

    if (err) {

      console.log(err);
      console.log(doc);
      process.exit();

    }

    console.log(err, docs);
    return cb(null);

  })

}, 1)

q.drain = function() {



}