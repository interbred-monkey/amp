// Globals
var mouse_pos = {};


// document ready function
$(document).ready(function() {

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
      click: {
        handle: '.search-row',
        method: function(el) {
        
          // get the url of the video
          var video_id = $(el).attr('data-id');
          var video_link = $(el).attr('link');

          // clear the timeout
          clearTimeout(sp);
          
          // close the search preview
          closeYouTubeSearchPreview();

          // get the video info to display
          getYouTubeVideoInfo(video_id);

          // make it display
          showYouTubeVideo(video_id);
          
        }
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
      }
    });
  }
  
});

var showYouTubeVideo = function(video_id) {

  if ($('[video_player] #video_player').length === 0) {
    var vp = $('<div/>').attr('id', 'video_player');
    $('[video_player]').html(vp);
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

  var playa = makeYtVideoPlayer(params);

  $('[video_player]').append(playa);

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
      $('[video-details]').html(res.data);
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