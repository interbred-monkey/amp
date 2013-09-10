
// document ready function
$(document).ready(function() {
  
  // make the youtube search a typeahead
  if ($('#youtube_search').length > 0) {
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
      callback: {
        handle: '.search-row',
        method: function(el) {
        
          // get the url of the video
          var vid_url = $(el).attr('link');
        
          // make it display
          showYouTubeVideo(vid_url);
          
        }
      }
    });
  }
  
});

var showYouTubeVideo = function(video_link) {
  
  console.log();
  
}