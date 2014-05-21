$(document).ready(function() {

  $(document).on('dblclick', '[song-row]', loadTrack);

})

// process the navigation in the music pages
var processMusicNav = function(params) {

  switch (params.path.length) {

    case 1:
      loadMusicGroup(params.path[0], function(data) {

        return renderMusicSection(data);

      })
      break;

    default:
      loadMusicGroupSubset(params.path, function(data) {

        return renderMusicSection(data);

      })
      break;

  }

}

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

// show a list of albums/songs for an artist
var renderArtistSubGroup = function(group, artist) {

  var params = [group, artist];

  loadMusicGroupSubset(params, function(data) {

    if (typeof data.html === "undefined") {

      return showSystemMessage(false, "Unable to load music library");

    }

    $('['+group+'-group]').html(data.html);

  })

}

// get a music group
var loadMusicGroup = function(group, callback) {

  group = (typeof group === "undefined"?$(this).attr('group'):group);

  var url = (group.toLowerCase() === "songs"?"/ajax/music-all":"/ajax/music-"+group+"-list");

  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: function(res){

      return callback(res.data);
      
    },
    error: function() {

      return showSystemMessage(false, "Unable to load music library");

    }

  });

}

// get a music group
var loadMusicGroupSubset = function(params, callback) {

  var data = {
    group: params[0],
    set: params[1]
  }

  if (typeof params[2] !== "undefined") {

    data.subset = params[2];

  }

  $.ajax({
    type: "GET",
    url: "/ajax/music-"+params[0],
    data: data,
    dataType: "json",
    success: function(res){

      return callback(res.data);
      
    },
    error: function() {

      return showSystemMessage(false, "Unable to load music library");

    }

  });

}

// add the html to the page
var renderMusicSection = function(data) {

  if (typeof data.html !== "undefined") {

    $('[music-browser]').html(data.html);

  }

  else {

    $('[music-browser]').html("<p>No music files</p>");
    
  }

}

// update the image cover image
var renderMusicCoverImage = function(image_url) {

  $('[music-image-cover]').css('background-image', 'url('+image_url+')');

}