var fe = require('./includes/file_system.js');

var callback_count = 0;

fe.setAllowedTypes(['mp3', 'ogg', 'wav']);

fe.folderFiles(__dirname+'/public/media/music', {recursive: false}, function(err, data) {
  
  callback_count++;

  console.log(data.length, callback_count);

})