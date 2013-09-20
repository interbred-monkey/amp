// Globals
var mouse_pos = {};


// document ready function
$(document).ready(function() {

  // make sure we are displaying the main page if there is no hash defined
  if (typeof window.location.hash === "undefined") {
   
    window.location.hash = "main";
  
  }

  // process the hash
  else {

    processHashChange(location.hash);

  }

  // setup a hashchange on the url
  $(window).bind('hashchange', function(){

    processHashChange(location.hash);
    return false;

  });

  // setup a mouse move for the search previews etc
  $(document).mousemove(function(evt) {
    mouse_pos.x = evt.pageX;
    mouse_pos.y = evt.pageY;
  });
  
  
  
});

// navigation
var processHashChange = function(hash) {

  var hash_bits = hash.split('/');

  hash_bits[0] = hash_bits[0].replace(/-/g,'_');

  if ($(hash_bits[0]+'_container').hasClass('hidden')) {

    $('[menu-item]').removeClass('active');
    $('[menu-item="'+hash_bits[0]+'"]').addClass('active');
    $('[container]').addClass('hidden');
    $(hash_bits[0]+'_container').removeClass('hidden');

  }

}

// prefill the search boxes
var prefillSearch = function(el) {

  $('.search-query').val(el.title);

  if ($('.search-query').hasClass('autocomplete')) {
    $('search-query').keyup();
  }

}