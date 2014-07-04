// calculate the api url
var cloudant_url = "https://interbredmonkey:guw2mf8r@interbredmonkey.cloudant.com:443";

// include the nano library
var nano = require('nano')(cloudant_url);

var mc = nano.db.use('music');

var buffer = [];
var pull_size = 100;
var processed_count = 0;

var processDocs = function(docs) {

  for (var d in docs) {

    if (typeof docs[d].path === "undefined") {

      continue;

    }

    docs[d].path = docs[d].path.replace(/\/Users\/simonmudd\/Desktop\/Tunes/ig, "/media/music");
    buffer.push(docs[d]);
    processed_count++;

  }

  mc.bulk({docs: buffer}, function(err, res) {

    if (err) {

      console.log("err: "+err);

    }

    if (processed_count < 1302) {

      return getDocs();

    }

    else {

      console.log('Done');

    }

  })

}

var getDocs = function() {

  var opts = {
    include_docs: true,
    limit: 100
  }

  if (processed_count !== 0) {

    opts.skip = processed_count;

  }

  mc.list(opts, function(err, docs) {

    if (err) {

      console.log(err);
      process.exit();

    }

    var return_docs = [];

    for (var dr in docs.rows) {

      return_docs.push(docs.rows[dr].doc);

    }

    return processDocs(return_docs);

  })

}

getDocs();