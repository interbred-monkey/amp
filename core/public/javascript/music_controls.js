var music_player;

$(function() {

  music_player = new musicPlayer();

})

var playTrack = function() {

  music_player.play();

  $('[play-btn]').addClass('hidden');
  $('[pause-btn]').removeClass('hidden');

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

var loadTrack = function(track_src) {

  if (typeof track_src === "undefined" || typeof track_src === "object") {

    track_src = $(this).attr('media');

  }

  music_player.changeSource(track_src);
  playTrack();

}

var playingEnded = function() {

  $('[play-btn]').removeClass('hidden');
  $('[pause-btn]').addClass('hidden');

}