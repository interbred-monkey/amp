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
      str: str
    },
    success: function(res){

      if (typeof res.data !== "undefined") {
        
        $('#web_results').html(res.data);
      
      }

      else {
      
        $('#web_results').html("<p>No Results</p>");
      
      }

      window.location.hash = "browser/web-results/?q="+encodeURIComponent(str);
      $('#web_search_container').addClass('hidden');
      $('#web_results_container').removeClass('hidden');

      new scrollInSetup('#fixed_search_bar');
      
    }

  });

}

var navigationSearch = function(params) {

  if (typeof params.qs.q === "undefined") {

    return false;

  }

  if (typeof params.qs !== "object") {

    $('#web_results').html("<p>No Results</p>");
    return false;
    
  }

  $('[web-search-input]').val(decodeURIComponent(params.qs.q));
  doWebSearch();

}