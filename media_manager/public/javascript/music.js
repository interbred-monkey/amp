// Globals
var music_player;

$(document).ready(function() {
  
  // load the music folder
  loadMusicBrowser();

});

var loadMusicBrowser = function() {

  $.ajax({
    type: "GET",
    url: "/ajax/file-browser",
    dataType: "json",
    data: {
      "type": "music"
    },
    success: function(res){

      if (typeof res.data !== "undefined") {
        $('[music-browser]').html(res.data);
      }

      else {
        $('[music-browser]').html("<p>No music files</p>");
      }
      
    }
  });

}