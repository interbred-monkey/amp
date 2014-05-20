$(function() {

  music_player = new musicPlayer();

})

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

    music_player.pause();

  }

  else {

    music_player.play();

  }

}

var loadTrack = function(track_src) {

  if (typeof track_src === "undefined") {

    track_src = $(this).attr('track_src');

  }

  music_player.changeSource(track_src);

}