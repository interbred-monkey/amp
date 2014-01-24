// File manager functions

var showFolderContent = function(el) {
  
  var folder = el.rel;

  if ($('#'+folder+'_content').length === 0) {

    return false;

  }

  $('#'+folder+'_content').toggleClass('hidden');

  if ($('[folder-rel="'+folder+'"').hasClass('glyphicon-folder-open') === true) {

    $('[folder-rel="'+folder+'"').removeClass('glyphicon-folder-open').addClass('glyphicon-folder-close'); 

  }

  else {

    $('[folder-rel="'+folder+'"').removeClass('glyphicon-folder-close').addClass('glyphicon-folder-open');

  }

}

var reindex = function(type) {

  $.ajax({
    type: "POST",
    url: "/ajax/reindex-"+type,
    dataType: "json",
    success: function(res){

      showSystemMessage(res.success, res.msg);
      
    },
    error: function() {

      showSystemMessage(false, "Unable to import <strong>"+type.toUpperCase()+"</strong>, please try again");

    }
  });

}