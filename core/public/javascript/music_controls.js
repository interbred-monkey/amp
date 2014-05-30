var music_player;

$(function() {

  music_player = new musicPlayer();
  setupMusicPlayerButtons();

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

  music_player.next();

}

var prevTrack = function() {

  music_player.previous();

}

var trackVolumeUp = function() {

  music_player.volumeUp();

}

var trackVolumeDown = function() {

  music_player.volumeDown();

}

var toggleTrackState = function() {

  if (music_player.current_state === "playing") {

    pauseTrack();

  }

  else {

    playTrack();

  }

}

var loadTrack = function(track_data) {

  showPlayerBar();

  if (typeof track_data === "undefined" || typeof track_data.src === "undefined") {

    track_data = {};
    track_data.src = $(this).attr('media');
    track_data.img = $(this).find('div:eq(0) div:eq(1) img').attr('src');
    track_data.title = $(this).children('div:eq(1)').children('span').text();
    track_data.artist = $(this).children('div:eq(3)').children('span').text();

  }

  music_player.changeSource(track_data.src);
  playTrack();
  displayTrackData(track_data);

}

var playingEnded = function() {

  $('[play-btn]').removeClass('hidden');
  $('[pause-btn]').addClass('hidden');

}

var displayTrackData = function(track_data) {
  
  var img_col = $('<div/>').addClass('col-md-1 nopad nlm nrm').append($('<img/>').attr('src', track_data.img));
  var track_span = $('<span/>').addClass('birth spaced-text').html('Now Playing: '+track_data.artist+' - '+track_data.title).append($('<span/>').attr('music-duration', ''));
  var track_col = $('<div/>').addClass('col-md-11 nlm').append(track_span);
  
  $('#now_playing').html(img_col).append(track_col);

}

var musicDurationUpdate = function(duration) {

  $('[music-duration]').text(" ("+duration+")");

}

var showPlayerBar = function() {

  if ($('#player_controls').hasClass('hidden')) {

    $('#player_controls').removeClass('hidden');

  }

}

var hidePlayerBar = function() {

  if (!$('#player_controls').hasClass('hidden')) {

    $('#player_controls').addClass('hidden');

  }

}

var setupMusicPlayerButtons = function() {

  $('#player_controls').on('click', '[play-btn]', function() {

    console.log('play');

    playTrack();

  })

  $('#player_controls').on('click', '[pause-btn]', function() {

    console.log('pause');

    pauseTrack();

  })

  $('#player_controls').on('click', '[next-btn]', function() {

    console.log('next');

    nextTrack();

  })

  $('#player_controls').on('click', '[prev-btn]', function() {

    console.log('prev');

    prevTrack();

  })

}