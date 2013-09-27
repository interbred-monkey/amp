// Bing Search Functions

var doBingSearch = function(el) {

  var str = $('#bing_search').val();

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
        
        $('[bing-results]').html(res.data);
      
      }

      else {
      
        $('[bing-results]').html("<p>No Results</p>");
      
      }

      $('[bing-results]').removeClass('hidden');
      window.location.hash = "main";
      
    }
  });

}