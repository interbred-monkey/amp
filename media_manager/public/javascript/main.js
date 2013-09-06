
// document ready function
$(document).ready(function() {
  
  // make the youtube search a typeahead
  if ($('#youtube_search').length > 0) {
    $('#youtube_search').typeahead({
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
            res = parseSuggestions(res);
            process(res);
          }
        });
      }
    });
  }
  
});