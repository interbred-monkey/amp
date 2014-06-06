$(function() {

})

var reindex = function(type) {

  $.ajax({
    type: "POST",
    url: "/ajax/reindex-"+type,
    dataType: "json",
    success: function(res){

      showSystemMessage(res.success, res.data);
      
    },
    error: function() {

      showSystemMessage(false, res.data.error);

    }
  })

}