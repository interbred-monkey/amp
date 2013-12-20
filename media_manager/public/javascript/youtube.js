// YouTube Functions

var yt_video_player = "";

// API ready
function onYouTubeIframeAPIReady() {
}

var makeYtVideoPlayer = function(params) {

  var ytp = new YT.Player(params.container, {
    height: params.height,
    width: params.width,
    playerVars: {
      controls: params.controls,
      autoplay: params.autoplay
    },
    videoId: params.video_id,
    events: {
      onStateChange: ytStateChange,
      onError: ytError
    }
  });

  return ytp;

}

var ytStateChange = function() {

  console.log("something");

}

var ytError = function() {

  console.log("error");

}

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
      video_id: video_id
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