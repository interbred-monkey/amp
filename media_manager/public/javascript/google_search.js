var doGoogleSearch = function() {
  
  var str = $('#google_search').val();

  // no value
  if (str === "") {
    return false;
  }

  $.ajax({
    type: "GET",
    url: '/ajax/google-search',
    data: {
      str: str
    },
    dataType: "json",
    success: function(res) {

      var frame = $('<iframe/>').html(res.data);
      $('[google-results]').html(frame);

    },
    error: function() {

      var html = $('<h4/>').text("No Results");
      $('[google-results]').html(html);

    }
  });

}