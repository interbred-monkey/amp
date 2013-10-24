$(document).ready(function() {

  var sp;

  typeahead({
    element: $('#youtube_search'),
    minLength: 3,
    source: function(str,process) {
      $.ajax({
        type: "GET",
        url: "/ajax/youtube-search",
        dataType: "json",
        data: {
          "str": str
        },
        success: function(res) {
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

});