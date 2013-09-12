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
          var vid_url = $(el).attr('link');
        
          // make it display
          showYouTubeVideo(vid_url);
          
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
    height: 170,
    width: 170,
    video_id: video_id,
    controls: 0,
    autoplay: 1
  }

  var playa = makeYtVideoPlayer(params);

  $('[search-preview]').append(playa);

}

var closeYouTubeSearchPreview = function(video_link) {
  
  $('[search-preview]').remove();
  
}