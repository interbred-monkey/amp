// include the underscore library
var _ = require('underscore');

// include the async library
var async = require('async');

// include the file_system library
var fs = require('fs');

// include the cloudant library
var cloudant = require('./includes/cloudant.js');

// include our config
var config = require('./config/__config.json');

// the list of config items to check
var config_checklist = ["cloudant", "directories"];

// checks to make sure all the databases are in place
var start = function() {
  
  if (_.isUndefined(config)) {

    console.log("********************** Startup Error: **********************");
    console.log('Config file is missing');
    process.exit();

  }

  for (var cc in config_checklist) {

    if (_.isUndefined(config[config_checklist[cc]])) {

      console.log("********************** Startup Error: **********************");
      console.log('The config for '+config_checklist[cc]+' is missing from the __config file');
      console.log('Please make sure this config exists before starting');
      process.exit();

    }

  }

  var actions = [];

  // check for the cloudant stuff
  actions.push(function(cb) {

    // load in the config files for the db's
    fs.readdir(__dirname+'/config', function(err, files) {

      var config_files = [];

      // filter out the right files
      for (var f in files) {

        if (files[f].match(/db_.*/)) {

          config_files.push(files[f]);

        }

      }

      cloudant.listdbs(function(err, data) {

        if (!_.isNull(err)) {

          console.log("********************** Startup Error: **********************");
          console.log('Unable to connect to cloudant databases');
          process.exit();

        }

        for (var cf in config_files) {

          var db_name = config_files[cf].match(/db_([a-z0-9_-]+).json/i);

          // missing db
          if (data.indexOf(db_name[1]) === -1) {

            (function(file_name, database) {

              processConfig(file_name, database);

            })(config_files[cf], db_name[1])

          }

          // check to make sure the views are there
          else {

            (function(file_name, database) {

              checkViewExists(file_name, database);

            })(config_files[cf], db_name[1])

          }

        }

      })

    })

    cb(null);

  })

  // check the directories
  actions.push(function(cb) {

    for (var cd in config.directories) {

      (function(local_dir, real_path) {

        fs.readlink(__dirname+'/public/media/'+local_dir, function(err, linkstring) {

          // file already exists
          if (err && err.errno === 18 && config.debug === true) {

            console.log("Error reading "+local_dir+" directory, file already exists");

          }

          else if (real_path !== linkstring) {

            if (fs.existsSync(__dirname+'/public/media/'+local_dir)) {

              fs.unlinkSync(__dirname+'/public/media/'+local_dir);

            }

            fs.symlink(real_path, __dirname+'/public/media/'+local_dir, 'dir', function(err) {})

          }

        })


      })(cd, config.directories[cd])

    }

    cb(null);

  })

  // check to see if we need to start importing files
  actions.push(function(cb) {

    var params = {
      db: "queues",
      design_name: "matching",
      view_name: "queueName",
      opts: {
        reduce: true,
        group: true,
        group_level: 1
      }
    }

    cloudant.view(params, function(err, data) {

      if (!_.isNull(err)) {

        if (config.debug === true) {

          console.log(err);

        }        

      }

      else if (data.rows.length > 0) {

        for (var dr in data.rows) {

          require('./importers/'+data.rows[dr].key+'_import').startImport(function(err, data) {});

        }

      }

      return cb(null);

    })

  })

  async.parallel(actions, function(err, data) {});

}

var processConfig = function(config_file, database) {

  var actions = {};

  actions.add = function(cb) {

    cloudant.createdb({db: database}, function(err, data) {
      
      if (!_.isNull(err)) {

        return cb("Unable to create db "+database, data);

      }

      else {

        return cb(null, data);

      }

    })

  }

  actions.addBulk = function(cb) {

    var params = {
      db: database,
      docs: require('./config/'+config_file).documents
    }

    cloudant.addBulk(params, function(err, data) {

      if (!_.isNull(err)) {

        return cb("Unable to add documents to db "+database, data);

      }

      else {

        return cb(null, data);

      }

    })

  }

  async.series(actions, function(err, data) {

    if (err) {

      console.log("********************** Startup Error: **********************");
      console.log(err+" check config to ensure DB access\n");
      console.log(data);
      process.exit();

    }

  })

}

var checkViewExists = function(config_file, database) {

  var doc_ids = [];
  var existing_ids = {};

  var docs = require('./config/'+config_file).documents;

  for (var d in docs) {

    doc_ids.push(docs[d]._id);

  }

  var params = {
    db: database,
    keys: doc_ids
  }

  cloudant.getBulk(params, function(err, data) {

    if (!_.isNull(err)) {

      console.log("********************** Startup Error: **********************");
      console.log('Unable to pull design documents for db: '+database+" check config to ensure DB access\n");
      console.log(data);
      process.exit();

    }

    // check the views we have to see if they are the same
    for (var dr in data.rows) {

      // have we got an error or a document? either way find an id
      var doc_id = (_.isUndefined(data.rows[dr].id)?data.rows[dr].key:data.rows[dr].id);

      // get the right doc from the docs
      var config_doc = docs[doc_ids.indexOf(doc_id)];

      // document is missing
      if (_.isUndefined(data.rows[dr].doc) || _.isNull(data.rows[dr].doc)) {

        return addDocument(database, config_doc);

      }

      // save the revision
      var _rev = data.rows[dr].doc._rev;

      // remove it so that they will match better
      delete(data.rows[dr].doc._rev);

      // if the docs are not the same then update it
      if (JSON.stringify(data.rows[dr].doc) !== JSON.stringify(config_doc)) {

        config_doc._rev = _rev;
        return addDocument(database, config_doc);

      }

    }

    // just return if there is nothing to do
    return;

  })

}

var addDocument = function(database, doc) {

  var params = {
    db: database,
    doc: doc
  }

  cloudant.add(params, function(err, data) {

    if (!_.isNull(err)) {

      console.log("********************** Startup Error: **********************");
      console.log("Unable to add design documents to db "+database+" check config to ensure DB access");
      process.exit();

    }

  })

  return;

}

var removeDB = function(database) {

  var params = {
    db: database
  }

  cloudant.destroydb(params, function(err, data) {

    if (!_.isNull(err)) {

      console.log("********************** Startup Error: **********************");
      console.log("Unable to remove db "+database+" check config to ensure DB access");
      process.exit();

    }

  })

}

module.exports = {
  start: start
}