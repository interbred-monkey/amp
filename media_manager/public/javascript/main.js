// Globals
var mouse_pos = {};


// document ready function
$(document).ready(function() {

  // make sure we are displaying the main page if there is no hash defined
  if (typeof window.location.hash === "undefined") {
   
    window.location.hash = "main";
  
  }

  // process the hash
  else {

    processHashChange(location.hash);
    
  }

  // setup a hashchange on the url
  $(window).bind('hashchange', function(){

    processHashChange(location.hash);
    return false;

  });

  // setup a mouse move for the search previews etc
  $(document).mousemove(function(evt) {
    mouse_pos.x = evt.pageX;
    mouse_pos.y = evt.pageY;
  });
  
  // make the youtube search a typeahead
  if ($('#youtube_search').length > 0) {

    var sp;

    typeahead({
      element: $('#youtube_search'),
      minLength: 3,
      source: function(str,process){
        $.ajax({
          type: "GET",
          url: "/ajax/youtube-search",
          dataType: "json",
          data: {
            "str": str
          },
          success: function(res){
            process(res.data);
          }
        });
      },
      hover: {
        handle: '.search-row',
        over: function(el) {
        
          // get the url of the video
          var vid_id = $(el).attr('data-id');
          
          // make it display
          sp = setTimeout(function() {
            previewYouTubeSearchVideo(vid_id);
          }, 1500);
          
        },
        out: function(el) {

          clearTimeout(sp);

          // get the url of the video
          var vid_id = $(el).attr('data-id');

          closeYouTubeSearchPreview(vid_id);

        }
      },
      click: {
        handle: '.search-row',
        method: function(el) {
        
          // get the url of the video
          var video_id = $(el).attr('data-id');
          var video_link = $(el).attr('link');
          var video_artist = $(el).attr('artist');

          // do we have an artist?
          if (!video_artist) {
            video_artist = $('#youtube_search').val();
          }

          // change to the movies tab
          window.location.hash = "movies";

          // clear the timeout
          clearTimeout(sp);
          
          // close the search preview
          closeYouTubeSearchPreview();

          // show the info box
          $('[video-details]').removeClass('hidden');

          // get the video info to display
          getYouTubeVideoInfo(video_id);

          // find similar artists
          getArtistInfo(video_artist);

          // make it display
          showYouTubeVideo(video_id);
          
        }
      }
    });
  }
  
});

var showYouTubeVideo = function(video_id) {

  if ($('[video-player] div#video_player').length === 0) {
    $('#video_player').remove('');
    var vp = $('<div/>').attr('id', 'video_player');
    $('[video-player]').html(vp);
  }

  // make the yt video
  var params = {
    container: 'video_player',
    height: 750,
    width: 1200,
    video_id: video_id,
    controls: 1,
    autoplay: 1
  }

  // setup the yt video player
  makeYtVideoPlayer(params);

}

var getYouTubeVideoInfo = function(video_id) {

  $.ajax({
    type: "GET",
    url: "/ajax/youtube-video-info",
    dataType: "json",
    data: {
      "video_id": video_id
    },
    success: function(res){

      if (typeof res.data !== "undefined") {
        $('[video-info]').html(res.data);
      }

      else {
        $('[video-info]').html("<p>No video information</p>");
      }
      
    }
  });

}

var previewYouTubeSearchVideo = function(video_id) {
  
  if ($('[search-preview]').length === 0) {
    var svp = $('<div/>').attr('search-preview', '');
    var svp_div = $('<div/>').attr('id', 'preview_search_video');

    $(svp).append(svp_div);
    $('body').append(svp);
  }

  $('[search-preview]').css({
                              top: mouse_pos.y,
                              left: mouse_pos.x
                             });
  
  // make the yt video
  var params = {
    container: 'preview_search_video',
    height: 270,
    width: 270,
    video_id: video_id,
    controls: 0,
    autoplay: 1
  }

  var playa = makeYtVideoPlayer(params);

  $('[search-preview]').append(playa);

}

var closeYouTubeSearchPreview = function() {
  
  $('[search-preview]').remove();
  
}

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

var processHashChange = function(hash) {

  var hash_bits = hash.split('/');

  hash_bits[0] = hash_bits[0].replace(/-/g,'_');

  if ($(hash_bits[0]+'_container').hasClass('hidden')) {

    $('[menu-item]').removeClass('active');
    $('[menu-item="'+hash_bits[0]+'"]').addClass('active');
    $('[container]').addClass('hidden');
    $(hash_bits[0]+'_container').removeClass('hidden');

  }

}