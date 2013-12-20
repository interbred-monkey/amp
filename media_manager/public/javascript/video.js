// Globals
var video_player;

$(document).ready(function() {
  
  // load the video folder
  loadVideoBrowser();

});

var loadVideoBrowser = function() {

  $.ajax({
    type: "GET",
    url: "/ajax/file-browser",
    dataType: "json",
    data: {
      type: "video"
    },
    success: function(res){

      if (typeof res.data !== "undefined") {

        $('[video-browser]').html(res.data);

      }

      else {

        $('[video-browser]').html("<p>No video files</p>");
        
      }
      
    }
  });

}

var playVideo = function(el) {

  var src = $(el).attr('media-path');
  var ext = $(el).attr('ext');

  video_player = $('<video/>').attr({
    width: "100%",
    height: "100%",
    controls: "",
    buffer: "auto"
  }).get(0);

  var source = $('<source/>').attr({
    src: src,
    type: "video/"+ext
  });

  $(video_player).append(source);
  $('#video_player').html(video_player);
  video_player.play();

}