$(document).ready(function() {
  
  // load the music folder
  loadMusicBrowser();

});

// get artist info
var getArtistInfo = function(artist) {

  $.ajax({
    type: "GET",
    url: "/ajax/artist-info",
    dataType: "json",
    data: {
      artist: artist
    },
    success: function(res){
      
      if (typeof res.data !== "undefined") {

        $('[artist-info]').html(res.data);
        $('[artist-info]').find('a').attr('target', '_blank');

        $('[accordion]').accordion();

      }

      else {

        $('[artist-info]').html('');

      }

    }
  });

}

// get just similar artists
var getSimilarArtists = function(artist) {

  $.ajax({
    type: "GET",
    url: "/ajax/similar-artists",
    dataType: "json",
    data: {
      artist: artist
    },
    success: function(res){
      
      if (typeof res.data !== "undefined") {

        $('[similar-artists]').html(res.data);

      }

      else {

        $('[similar-artists]').html('');
        
      }

    }
  });

}

var loadMusicBrowser = function() {

  $.ajax({
    type: "GET",
    url: "/ajax/music-browser",
    dataType: "json",
    success: function(res){

      if (typeof res.data !== "undefined") {

        $('[music-browser]').html(res.data);

      }

      else {

        $('[music-browser]').html("<p>No music files</p>");
        
      }
      
    },
    error: function() {

      showSystemMessage(false, "Unable to load music library");

    }
  });

}