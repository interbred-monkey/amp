// Bing Search Functions

var doWebSearch = function(el) {

  var str = $('[web-search-input]').val();

  if (str === "") {

    return false;
  
  }

  $.ajax({
    type: "GET",
    url: "/ajax/bing-search",
    dataType: "json",
    data: {
      "str": str
    },
    success: function(res){

      if (typeof res.data !== "undefined") {
        
        $('#web_results_container').html(res.data);
      
      }

      else {
      
        $('#web_results_container').html("<p>No Results</p>");
      
      }

      window.location.hash = "browser/web-results/?q="+encodeURIComponent(str);
      
    }
  });

}

var navigationSearch = function(qs) {

  if (typeof qs !== "object") {
    $('#web_results_container').html("<p>No Results</p>");
    return false;
  }

  $('[web-search-input]').val(qs.q);
  doWebSearch();

}