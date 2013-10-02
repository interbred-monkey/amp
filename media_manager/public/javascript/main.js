// Globals
var mouse_pos = {};
var number_of_backgrounds = 0;
var screen_width = 0;
var background_pages = {};

// document ready function
$(document).ready(function() {

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
  
  // make vertical elements middle
  if ($('.vertical-middle').length > 0) {

    $('.vertical-middle').each(function() {

      var ost = $(this).parents('[container]:last').offset().top;
      var h = ($(this).parents('[container]:last').height() / 2) - $(this).height();
      $(this).css('margin-top', h);

    });
  }

  // setup the navigation slider stuff
  number_of_backgrounds = $('[background]').length;
  screen_width = $('body').width();

  $('[background]').each(function(index) {

    background_pages[$(this).attr('background')] = index;
    $(this).width(screen_width);

  })
  
  $('[background-slider]').width(screen_width * number_of_backgrounds);

  // make sure we are displaying the main page if there is no hash defined
  if (typeof window.location.hash === "undefined" || window.location.hash === "") {
   
    window.location.hash = "browser/web-search";
  
  }

  // process the hash
  else {

    processHashChange(location.hash);

  }
  
});

// navigation
var processHashChange = function(hash) {

  var hash_bits = hash.split('/');
  $('[container]').addClass('hidden');
  $('[search-row]').addClass('hidden');

  // change the main displays
  for (var hb in hash_bits) {

    // replace into something we can use
    hash_bits[hb] = hash_bits[hb].replace(/-/g,'_');

    // add an active class to the menu
    if (hb == 0) {
      $('[menu-item]').removeClass('active');
      $('[menu-item="'+hash_bits[hb]+'"]').addClass('active');
    }

    // add a hash to the element
    else {
      hash_bits[hb] = '#'+hash_bits[hb];
    }

    // show the containers
    $(hash_bits[hb]+'_container').removeClass('hidden');

  }

  // change the menus
  $(hash_bits[0]+'_search_row').removeClass('hidden');

  // change the background
  navigationSlider(hash_bits[0].replace('#', ''));

}

var navigationSlider = function(page) {

  for (var bp in background_pages) {

    if (bp === page) {

      $('[background-slider]').animate({
        left: - parseInt(background_pages[bp] * screen_width)
      }, 'slow');

    }

  }

}

// prefill the search boxes
var prefillSearch = function(el) {

  $('.search-query').val(el.title);

  if ($('.search-query').hasClass('autocomplete')) {
    $('search-query').keyup();
  }

}

var reflectSearch = function(el) {

  $('['+$(el).attr('rel')+']').val($(el).val());

}