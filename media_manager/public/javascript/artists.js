
// get artist info
var getArtistInfo = function(artist) {

  $.ajax({
    type: "GET",
    url: "/ajax/artist-info",
    dataType: "json",
    data: {
      "artist": artist
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
      "artist": artist
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