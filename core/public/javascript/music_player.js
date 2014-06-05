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
  _repeat_one: false,
  _shuffle_tracks: false,
  _duration: ""
}

musicPlayer.prototype.setup = function() {

  _musicPlayer.generatePlayer();

  $(_musicPlayer._mp).bind('loadedmetadata', _musicPlayer.playerChangedTrack);
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

musicPlayer.prototype.updatePlayIndex = function(_index) {

  if (isNaN(_index) || _musicPlayer._play_index === _index) {

    return false;

  }

  _musicPlayer._play_index = _index;

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

musicPlayer.prototype.hasPlaylist = function() {

  return (_musicPlayer._play_list.length === 0?false:true);

}

musicPlayer.prototype.repeat = function() {

  _musicPlayer._mp.loop = (this._mp.loop === true?false:true);

}

musicPlayer.prototype.repeatAll = function() {

  _musicPlayer._repeat_all = (this._repeat_all === true?false:true);

}

musicPlayer.prototype.nextTrack = function() {

  _musicPlayer._play_index++;

  if (_musicPlayer._play_index >= _musicPlayer._play_list.length) {

    _musicPlayer._play_index = 0;

  }

  _musicPlayer.changeSource(_musicPlayer._play_list[_musicPlayer._play_index].src);
  _musicPlayer.play();

  return _musicPlayer._play_list[_musicPlayer._play_index];

}

musicPlayer.prototype.previousTrack = function() {

  _musicPlayer._play_index--;

  if (_musicPlayer._play_index === -1) {

    _musicPlayer._play_index = (_musicPlayer._play_list.length - 1 > 0?_musicPlayer._play_list.length - 1:0);

  }

  _musicPlayer.changeSource(_musicPlayer._play_list[_musicPlayer._play_index].src);
  _musicPlayer.play();

  return this._play_list[_musicPlayer._play_index];

}

musicPlayer.prototype.playerEnded = function() {

  if (_musicPlayer._repeat === true) {

    _musicPlayer.play();
    return false;

  }

  // start from the begining if we are at the end
  if (_musicPlayer._repeat_all === true && _musicPlayer._play_index === _musicPlayer._play_list.length - 1) {

    _musicPlayer._play_index = -1;
    _musicPlayer.nextTrack();
    return;

  }

  // play the next track if there is one
  else if (_musicPlayer._play_index < _musicPlayer._play_list.length -1) {

    _musicPlayer.nextTrack();
    return;

  }

  // if we get here there is nothing else to play
  playingEnded();

}

musicPlayer.prototype.playerChangedTrack = function() {

  var _d = moment.unix(_musicPlayer._mp.duration);
  
  var _time_format = (_d.hours() > 0?"hh:mm:ss":"mm:ss");

  _musicPlayer._duration = _d.format(_time_format);

  _musicPlayer._play_list[_musicPlayer._play_index].duration = _d.format(_time_format);

  if (typeof updatedTrackData === "function") {

    updatedTrackData(_musicPlayer._play_list[_musicPlayer._play_index]);

  }

  return;

}

musicPlayer.prototype.isPlaying = function() {

  return (_musicPlayer._mp.paused === false?true:false);

}

musicPlayer.prototype.volumeUp = function() {

  if(_musicPlayer._mp.volume < 1){

    _musicPlayer._mp.volume += 0.1;

  }

  else{

    _musicPlayer._mp.volume = 1;

  }

  return;

}

musicPlayer.prototype.volumeDown = function() {

  if(_musicPlayer._mp.volume > 0.1){

    _musicPlayer._mp.volume -= 0.1;

  }

  else{

    _musicPlayer._mp.volume = 0;

  }

  return;

}

musicPlayer.prototype.setVolume = function(_num) {

  if (isNaN(_num) || _num > 1 || _num < 0) {

    return false;

  }

  _musicPlayer._mp.volume = _num;

}