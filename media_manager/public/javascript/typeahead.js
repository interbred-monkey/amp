/* Custom Typeahead */

var typeahead = function(__params) {
  
  var __el = __params.element;
  
  var __el_pos = $(__el).offset();
  var __el_width = $(__el).width();
  var __container = $('<div/>');
  
  $(__container).attr('typeahead-suggestions','')
                .css({
                    top: __el_pos.top + 30,
                    left: __el_pos.left,
                    width: __el_width
                 });
  
  // make a keyup on the input
  $(__el).on('keyup', function() {
    
    // not long enough yet
    if (this.value.length < __params.minLength) {
      return;
    }
    
    // get some data
    __params.source.call(this, this.value, _renderSuggestions);
    
  });
  
  var _renderSuggestions = function(__data) {
    
    // clear the container
    $(__container).remove();
    
    // array of suggestions
    if (typeof __data === "object") {
      
      // make a list
      var __ul = $('<ul/>');
      
      // loopity loop
      for (var __i in __data) {
        var __li = $('<li/>').text(__data[__i]);
        __ul.append(__li);
      }
        
      $(__container).append(__ul);
      
    }
    
    // html has been provided
    else if (typeof __data === "string") {
      $(__container).html(__data);
    }
    
    $('body').append(__container);
    _addEventClick();
    
  }
  
  var _addEventClick = function() {
    // make a click event on the callback handle
    if (typeof __params.callback !== "undefined") {
      $(__container).find(__params.callback.handle).on('click', function() {
        __params.callback.method.call(this, this);
      });
    }
  }
  
}