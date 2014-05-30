var _musicPlayer;

var musicPlayer = function() {

  _musicPlayer = this;

  _musicPlayer.setup();

}

musicPlayer.prototype = {
  _mp: null,
  _play_list: [],
  _play_index: 0,
  _current_state: null,
  _src: "",
  _repeat_all: false,
  _duration: ""
}

musicPlayer.prototype.setup = function() {

  _musicPlayer.generatePlayer();

  $(_musicPlayer._mp).bind('volumechange', function() {

    console.log(_musicPlayer._mp.volume);

  })

  $(_musicPlayer._mp).bind('loadedmetadata', _musicPlayer.playerDurationChange);
  $(_musicPlayer._mp).bind('ended', _musicPlayer.playerEnded);

}

musicPlayer.prototype.generatePlayer = function() {

  if (_musicPlayer._mp !== null) {

    return false;

  }

  $('body').append($('<audio/>'));

  _musicPlayer._mp = $('audio').get(0);

}

musicPlayer.prototype.changeSource = function(_src) {

  _musicPlayer.pause();
  _musicPlayer._mp.src = _src;
  _musicPlayer._src = _src;

}

musicPlayer.prototype.pause = function() {

  _musicPlayer._mp.pause();
  _musicPlayer._current_state = "paused";

}

musicPlayer.prototype.play = function() {

  _musicPlayer._mp.play();
  _musicPlayer._current_state = "playing";

}

musicPlayer.prototype.clearPlaylist = function() {

  _musicPlayer._play_list = [];

}

musicPlayer.prototype.addToPlaylist = function(_obj) {

  _musicPlayer._play_list.push(_obj);

}

musicPlayer.prototype.addPlaylist = function(_play_list) {

  _musicPlayer._play_list = _play_list;

}

musicPlayer.prototype.repeat = function() {

  _musicPlayer._mp.loop = (this._mp.loop === true?false:true);

}

musicPlayer.prototype.repeatAll = function() {

  _musicPlayer._repeat_all = (this._repeat_all === true?false:true);

}

musicPlayer.prototype.nextTrack = function() {

  _musicPlayer._play_index = this._play_index + 1;

  if (this._play_index >= this._play_list.length) {

    this._play_index = 0;

  }

  _musicPlayer.changeSource(this._play_list[this._play_index].filepath);
  _musicPlayer.play();

}

musicPlayer.prototype.previousTrack = function() {

  _musicPlayer._play_index = _musicPlayer._play_index - 1;

  if (this._play_index < 0) {

    this._play_index = _musicPlayer._play_list.length - 1;

  }

  _musicPlayer.changeSource(_musicPlayer._play_list[_musicPlayer._play_index].filepath);
  _musicPlayer.play();

}

musicPlayer.prototype.playerEnded = function() {

  if (_musicPlayer._repeat === true) {

    return false;

  }

  if (_musicPlayer._repeat_all === true && _musicPlayer._play_index === _musicPlayer._play_list.length - 1) {

    _musicPlayer._play_index = -1;
    _musicPlayer.nextTrack();

  }

  // if we get here there is nothing else to play
  playingEnded();

}

musicPlayer.prototype.playerDurationChange = function() {

  var _d = moment.unix(_musicPlayer._mp.duration);
  
  var _time_format = (_d.hours() > 0?"hh:mm:ss":"mm:ss");

  _musicPlayer._duration = _d.format(_time_format);

  if (typeof musicDurationUpdate === "function") {

    return musicDurationUpdate(_musicPlayer._duration);

  }

  return;

}