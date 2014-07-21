// Globals
var mouse_pos = {};
var navigation_functions;

// document ready function
$(document).ready(function() {

  // navigation specials
  navigation_functions = {
    browser: navigationSearch,
    music: processMusicNav
  }

  // setup a hashchange on the url
  $(window).bind('hashchange', function(){

    processHashChange(location.hash);
    return false;

  })

  // setup a mouse move for the search previews etc
  $(document).mousemove(function(evt) {

    mouse_pos.x = evt.pageX;
    mouse_pos.y = evt.pageY;

  })
  
  // make vertical elements middle
  if ($('.vertical-middle').length > 0) {

    $('.vertical-middle').each(function() {

      var h = ($($(this).attr('rel')).height() / 2) - $(this).height();
      $(this).css('margin-top', h);

    })

  }

  // make sure we are displaying the main page if there is no hash defined
  if (typeof window.location.hash === "undefined" || window.location.hash === "") {
   
    window.location.hash = "browser/web-search";
  
  }

  // process the hash
  else {

    processHashChange(location.hash);

  }

  // clicking on a nav item
  $(document).on('click', '[nav-item]', function() {

    location.hash = '#'+$(this).attr('nav-item');

  })
  
})

// navigation
var processHashChange = function(hash) {

  var hash_bits = hash.split('/');

  // replace into something we can use
  hash_bits[0] = hash_bits[0].replace(/-/g,'_');

  // make a version without the hash at the front
  var no_hash = hash_bits[0].replace('#', '');

  // add an active class to the menu
  if ($('[background="'+no_hash+'"]').hasClass('hidden')) {

    $('[related]').addClass('hidden');
    $('[background]').addClass('hidden');

    $('[background="'+no_hash+'"]').removeClass('hidden');
    $('[related="'+no_hash+'"]').removeClass('hidden');

    $('[menu-item]').removeClass('active');
    $('[menu-item="'+hash_bits[0]+'"]').addClass('active');

  }

  // if this is a long tail anchor
  if (hash_bits.length > 1) {

    // is this a query string
    if (hash_bits[1].match(/\?/)) {

      return;

    }

    // do we have a function to call
    if (_contains(navigation_functions, no_hash) === true) {

      var params = {};

      params.path = hash_bits.slice(1);
      params.qs = processQueryString(hash_bits[hash_bits.length - 1]);

      highlightSubNav(params.path);

      navigation_functions[no_hash].call(undefined, params);

    }

    // no function, do nuffin
    else {

      return;

    }

  }

}

// highlight the sub nav items
var highlightSubNav = function(path_bits) {

  // remove the active class
  $('[nav-item]').parent().removeClass('active');

  $('[nav-item]').each(function(i, el) {

    if ($(el).attr('nav-item').match(path_bits[0])) {

      $(el).parent().addClass('active');
      return false;

    }

  })

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

  if (!str[0].match(/\?/)) {

    return params;

  }

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

var scrollSetup = function(opts, _callback) {

  var _instance = this;
  _instance._monitor_scroll = true;
  _instance._handle = opts.handle;
  _instance._position = $(opts.handle).offset();
  _instance._offset_distance = (typeof opts.offset !== "undefined"?opts.offset:null);

  _instance.setup = (function() {

    $(window).on('scroll', function(evt) {

      if (_instance._monitor_scroll === false) {

        return;

      }

      return (_instance._offset_distance === null?calculate():calculateOffset());

    })

  })()

  var calculate = function() {

    var _scroll_top = $('body').scrollTop();

    if (_scroll_top > _instance._position.top) {

      return _callback(true, _scroll_top - _instance._position.top);

    }

    else {

      return _callback(false, null);

    }

  }

  var calculateOffset = function() {

    console.log($(_instance._handle).offset().top, _instance._offset_distance, $('body').scrollTop(), $('body').scrollTop() + _instance._offset_distance);

    var _scroll_position = $('body').scrollTop() + _instance._offset_distance;

    if (_scroll_position >= $(_instance._handle).offset().top) {

      return _callback(true, _scroll_position - $(_instance._handle).offset());

    }

    else {

      return _callback(false, null);

    }

  }

  _instance.pauseScroll = function() {

    _instance._monitor_scroll = false;

  }

  _instance.resumeScroll = function() {

    _instance._monitor_scroll = true;

  }

}

var scrollInSetup = function(_el) {

  var _instance = null;
  var _handle = _el;
  var _trigger = $(_el).attr('scroll-trigger');
  var _scroll_stop = $(_el).attr('scroll-stop');

  var _result = function(_hidden, _offset) {

    if (_hidden) {

      $(_handle).removeClass('scroll-in-hidden');

    }
    else {

      $(_handle).addClass('scroll-in-hidden');

    }

  }

  return _instance = new scrollSetup({handle: _trigger}, _result);

}

var addFillerBar = function(height) {

  var filler_bar = $('<div/>').addClass('filler_bar').height(height);
  $(filler_bar).insertAfter('[main]');

}

var removeFillerBar = function(height) {

  $('.filler_bar').remove();

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