// include the underscore library
var _ = require('underscore');

// include the file system library
var fs = require('fs');

var log_errors = function(errors, type) {

  fs.stat(__dirname+'/../error_logs', function(stats) {

    if (stats.isDirectory() === false) {

      fs.mkdir(__dirname+'/../error_logs', function() {

        fs.writeFile(__dirname+'/../error_logs/'+type+'_import_errors.json', JSON.stringify(errors, undefined, 2), function() {

          console.log('errors wrote to '+type+'_import_errors.json');

        });

      });

    }

    else {

      fs.writeFile(__dirname+'/../error_logs/'+type+'_import_errors.json', JSON.stringify(errors, undefined, 2), function() {

        console.log('errors wrote to '+type+'_import_errors.json');

      });

    }

  });

}

module.exports = {
  log_errors: log_errors
}