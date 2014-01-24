// Globals
var mouse_pos = {};
var navigation_functions;

// document ready function
$(document).ready(function() {

  // navigation specials
  navigation_functions = {
    web_results: navigationSearch
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
  
  // make vertical elements middle
  if ($('.vertical-middle').length > 0) {

    $('.vertical-middle').each(function() {

      var h = ($($(this).attr('rel')).height() / 2) - $(this).height();
      $(this).css('margin-top', h);

    });
  }

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

    // is this a query string
    if (hash_bits[hb].match(/\?/)) {

      continue;

    }

    // replace into something we can use
    hash_bits[hb] = hash_bits[hb].replace(/-/g,'_');

    // make a version without the hash at the front
    var no_hash = hash_bits[hb].replace('#', '');
  
    // do we have a function to call
    if (_contains(navigation_functions, no_hash) === true) {

      var qs = processQueryString(hash_bits[hash_bits.length - 1]);
      navigation_functions[hash_bits[hb]].call(undefined, qs);

    }

    // add an active class to the menu
    if (hb == 0) {

      if ($('[background="'+no_hash+'"]').hasClass('hidden')) {

        $('[background]').addClass('hidden');
        $('[background="'+no_hash+'"]').removeClass('hidden');

      }

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

var loadMedia = function(el, type) {

  switch(type) {

    case "video":
      playVideo(el);
      break;

  }

}

var processQueryString = function(str) {

  var params = {};

  str = str.substr(1);
  var str_bits = str.split('&');

  // loop the bits
  for (var sb in str_bits) {

    var row = str_bits[sb].split('=');

    if (row.length === 0) {
      
      continue;

    }

    params[row[0]] = row[1];

  }

  return params;

}

var showSystemMessage = function(success, message) {

  $('.system-message').remove();

  if (success === false) {

    var success_class = 'alert-danger';

  }

  else if (success === true) {

    var success_class = 'alert-success';

  }

  var span = $('<span/>').html(message);
  var div = $('<div/>').addClass('system-message col-md-2 alert '+success_class).html(span);
  $('body').append(div);

  setTimeout(function() {

    $(div).addClass('transparent');

  }, 6000);

}

var _contains = function(_o, _v) {

  if (typeof _o !== "object") {
  
    return false;
  
  }

  var _f = false;

  for (var _i in _o) {

    if (_o[_i] === _v || _i === _v) {

      _f = true;
      break;

    }

  }

  return _f;

}