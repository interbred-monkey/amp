var music_player;

$(function() {

  music_player = new musicPlayer();
  setupMusicPlayerButtons();
  setupMusicPlayerKeypresses();

})

var playTrack = function() {

  music_player.play();

  $('[play-btn]').addClass('hidden');
  $('[pause-btn]').removeClass('hidden');

}

var pauseTrack = function() {

  music_player.pause();

  $('[play-btn]').removeClass('hidden');
  $('[pause-btn]').addClass('hidden');

}

var nextTrack = function() {

  music_player.nextTrack();

}

var prevTrack = function() {

  music_player.previousTrack();

}

var trackVolumeUp = function() {

  music_player.volumeUp();

}

var trackVolumeDown = function() {

  music_player.volumeDown();

}

var changeTrackVolume = function(level) {

  music_player.setVolume(level)

}

var loadTrack = function(track_data) {

  showPlayerBar();

  if (typeof track_data === "undefined" || typeof track_data.src === "undefined") {

    track_data = htmlTrackData(this);
    createVisibleTrackList(this);

  }

  music_player.changeSource(track_data.src);
  playTrack();

}

var updatedTrackData = function(track_data) {

  displayTrackData(track_data);

}

var playingEnded = function() {

  $('[play-btn]').removeClass('hidden');
  $('[pause-btn]').addClass('hidden');

}

var displayTrackData = function(track_data) {
  
  var img_col = $('<div/>').addClass('col-md-1 nopad nlm nrm').append($('<img/>').attr('src', track_data.img));
  var track_span = $('<span/>').addClass('birth spaced-text').html('Now Playing: '+track_data.artist+' - '+track_data.title).append($('<span/>').attr('music-duration', '').text(" ("+track_data.duration+")"));
  var track_col = $('<div/>').addClass('col-md-11 nlm').append(track_span);
  
  $('#now_playing').html(img_col).append(track_col);

}

var showPlayerBar = function() {

  if ($('#player_controls').hasClass('hidden')) {

    $('#player_controls').removeClass('hidden');
    var bar_height = $('#player_controls').height() * 2;
    addFillerBar(bar_height);

  }

}

var hidePlayerBar = function() {

  if (!$('#player_controls').hasClass('hidden')) {

    $('#player_controls').addClass('hidden');
    removeFillerBar();

  }

}

var setupMusicPlayerButtons = function() {

  $('#player_controls').on('click', '[play-btn]', function() {

    playTrack();

  })

  $('#player_controls').on('click', '[pause-btn]', function() {

    pauseTrack();

  })

  $('#player_controls').on('click', '[next-btn]', function() {

    nextTrack();

  })

  $('#player_controls').on('click', '[prev-btn]', function() {

    prevTrack();

  })

  $('[mp-volume-slider]').on('change', '[volume-slider]', function() {

    changeTrackVolume($(this).val());

  })

}

var setupMusicPlayerKeypresses = function() {

  $(document).on('keydown',function(e){
    
    // if it's the search box then dont bother
    if(e.target.nodeName === "INPUT"){

      return false;

    }

    console.log(e.keyCode);
    var matched_keycode = false;
  
    switch(e.keyCode){
      
      //Spacebar for pausing and playing
      case 32:
        (music_player.isPlaying() === true?pauseTrack():playTrack());
        matched_keycode = true;
      break;

      //N or right arrow - next song
      case 39:
      case 110:
        nextTrack();
        matched_keycode = true;
      break;

      //B - Previous song
      case 37:
      case 98:
        prevTrack();
        matched_keycode = true;
      break;

      //+ - Volume up
      case 38:
      case 43:
        trackVolumeUp();
        matched_keycode = true;
      break;

      //- - Volume down
      case 40:
      case 45:
        trackVolumeDown();
        matched_keycode = true;
      break;

      //M - Mute
      case 109:
        muteVolume();
        matched_keycode = true;
      break;

    }

    if (matched_keycode === true) {

      // prevent scrolling etc
      e.preventDefault();

    }

  })

}