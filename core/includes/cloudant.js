// include the config
var config = require('./config/__config.json');

// include the underscore library
var _ = require('underscore');

// calculate the api url
var cloudant_url = "https://"+config.cloudant.username+":"+config.cloudant.password+"@"+config.cloudant.username+".cloudant.com:"+config.cloudant.port;

// include the nano library
var nano = require('nano')(cloudant_url);

// central store for the db's
var dbs = {
  music: nano.db.use('music')
}

// get a db information
var getdb = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  nano.db.get(params.db, function(err, doc) {

    if (config.debug) {

      console.log("Get DB: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to fetch db information", err);

    }

    return callback(null, doc);

  })

}

// create a db
var createdb = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  nano.db.create(params.db, function(err, doc) {

    if (config.debug) {

      console.log("Create DB: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to create db", err);

    }

    // add a reference to the db
    dbs[params.db] = nano.db.use(params.db);

    return callback(null, doc);

  })

}

// get a list of dbs
var listdbs = function(callback) {

  nano.db.list(function(err, doc) {

    if (config.debug) {

      console.log("List DBs:");
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to find any dbs");

    }

    return callback(null, doc);

  })

}

// delete a db
var destroydb = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  nano.db.destroy(params.db, function(err, doc) {

    if (config.debug) {

      console.log("Destroy DB: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to find db", err);

    }

    // remove the reference to the db
    delete(dbs[params.db]);

    return callback(null);

  })

}

// replicate a db
var replicatedb = function(params, callback) {

  if (_.isUndefined(params.from) || !_.isString(params.from)) {

    return callback("from db not valid");

  }

  if (_.isUndefined(params.to) || !_.isString(params.to)) {

    return callback("to db not valid");

  }

  nano.db.replicate(params.from, params.to, params, function(err, doc) {

    if (config.debug) {

      console.log("Replicate DB from: "+params.from);
      console.log("Replicate DB to: "+params.to);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to replicate db", err);

    }

    // add a reference to the DB
    dbs[params.to] = nano.db.use(params.to);

    return callback(null);

  })

}

// get a document from a db
var get = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.id) || !_.isString(params.id)) {

    return callback("doc to pull not valid");

  }

  dbs[params.db].get(params.id, function(err, doc) {

    if (config.debug) {

      console.log("Get: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to find doc");

    }

    return callback(null, doc);

  })

}

// get the head of a document from the db
var head = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.id) || !_.isString(params.id)) {

    return callback("doc to pull not valid");

  }

  dbs[params.db].head(params.id, function(err, doc) {

    if (config.debug) {

      console.log("Head: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to find doc");

    }

    return callback(null, doc);

  })

}

// get all documents from a db
var list = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  dbs[params.db].list(function(err, docs) {

    if (config.debug) {

      console.log("List: "+params.db);
      console.log(err, docs);

    }

    if (err || docs.rows.length === 0) {

      return callback("Unable to find docs");

    }

    var return_docs = [];

    // if they want the docs then just give them back the docs
    if (!_.isUndefined(params.opts) && params.opts.include_docs === true) {

      for (var dr in docs.rows) {

        return_docs.push(docs.rows[dr].doc);

      }

    }

    return callback(null, (!_.isEmpty(return_docs)?return_docs:docs));

  })

}

// insert a document into the db
var add = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.doc) || !_.isObject(params.doc)) {

    return callback("doc to insert not valid");

  }

  dbs[params.db].insert(params.doc, function(err, doc) {

    if (config.debug) {

      console.log("Add: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to add doc");

    }

    return callback(null, doc);

  })

}

// insert a document into the db
var destroy = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.rev) || !_.isString(params.rev)) {

    return callback("rev not valid");

  }

  if (_.isUndefined(params.id) || !_.isObject(params.id)) {

    return callback("doc to delete not valid");

  }

  dbs[params.db].destroy(params.id, params.rev, function(err, doc) {

    if (config.debug) {

      console.log("Destroy: "+params.db);
      console.log(err, doc);

    }

    if (err) {

      return callback("Unable to delete doc");

    }

    return callback(null, doc);

  })

}

// get many documents from a db
var getBulk = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.keys) || !_.isArray(params.keys)) {

    return callback("docs to pull is not valid");

  }

  dbs[params.db].fetch({keys: params.keys}, function(err, docs) {

    if (config.debug) {

      console.log("Bulk Get: "+params.db);
      console.log(err, docs);

    }

    if (err || docs.rows.length === 0) {

      return callback("Unable to find docs");

    }

    var return_docs = [];

    // if they want the docs then just give them back the docs
    if (!_.isUndefined(params.opts) && params.opts.include_docs === true) {

      for (var dr in docs.rows) {

        return_docs.push(docs.rows[dr].doc);

      }

    }

    return callback(null, (!_.isEmpty(return_docs)?return_docs:docs));

  })

}

// insert many documents into a db
var addBulk = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.docs) || !_.isArray(params.docs)) {

    return callback("docs to add is not valid");

  }

  dbs[params.db].bulk({"docs": params.docs}, function(err, docs) {

    if (config.debug) {

      console.log("Bulk Add: "+params.db);
      console.log(err, docs);

    }

    if (err) {

      return callback("Unable to add docs");

    }

    return callback(null, docs);

  })

}

// get the docs from a view
var view = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.design_name) || !_.isString(params.design_name)) {

    return callback("design doc name is not valid");

  }

  if (_.isUndefined(params.view_name) || !_.isString(params.view_name)) {

    return callback("view name is not valid");

  }

  dbs[params.db].view(params.design_name, params.view_name, params.opts, function(err, docs) {

    if (config.debug) {

      console.log("View: _design/"+params.design_name+"/_view/"+params.view_name);
      console.log(err, docs);

    }

    if (err || docs.rows.length === 0) {

      return callback("Unable to find docs");

    }

    var return_docs = [];

    // if they want the docs then just give them back the docs
    if (!_.isUndefined(params.opts) && params.opts.include_docs === true) {

      for (var dr in docs.rows) {

        return_docs.push(docs.rows[dr].doc);

      }

    }

    return callback(null, (!_.isEmpty(return_docs)?return_docs:docs));

  })

}

// do a search on the db
var search = function(params, callback) {

  if (_.isUndefined(params.db) || !_.isString(params.db)) {

    return callback("db not valid");

  }

  if (_.isUndefined(params.design_name) || !_.isString(params.design_name)) {

    return callback("design doc name is not valid");

  }

  if (_.isUndefined(params.search_name) || !_.isString(params.search_name)) {

    return callback("search name is not valid");

  }

  dbs[params.db].search(params.design_name, params.search_name, params.opts, function(err, docs) {

    if (config.debug) {

      console.log("Search: _design/"+params.design_name+"/_search/"+params.search_name);
      console.log(err, docs);

    }

    if (err || docs.rows.length === 0) {

      return callback("Unable to find docs");

    }

    // if they want the docs then just give them back the docs
    if (!_.isUndefined(params.opts) && params.opts.include_docs === true) {

      for (var dr in docs.rows) {

        docs.rows[dr] = docs.rows[dr].doc;

      }

    }

    return callback(null, docs);

  })

}

module.exports = {
  getdb: getdb,
  createdb: createdb,
  listdbs: listdbs,
  destroydb: destroydb,
  replicatedb: replicatedb,
  get: get,
  head: head,
  list: list,
  add: add,
  destroy: destroy,
  getBulk: getBulk,
  addBulk: addBulk,
  view: view,
  search: search
}