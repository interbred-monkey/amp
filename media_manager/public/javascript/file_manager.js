// File manager functions

var showFolderContent = function(el) {
  
  var folder = el.rel;

  if ($('#'+folder+'_content').length === 0) {

    return false;

  }

  $('#'+folder+'_content').toggleClass('hidden');
  $('[folder-rel="'+folder+'"').toggleClass('icon-folder-open');


}