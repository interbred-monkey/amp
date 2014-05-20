var music_player = null;

var musicPlayer = function() {
  
  var _mp             = null,
      _play_list      = [],
      _play_index     = 0,
      _current_state  = null,
      _src            = null,
      _repeat_all     = false;

  this.setup();

}

musicPlayer.prototype.generatePlayer = function() {

  if (typeof this._mp !== "null") {

    return false;

  }

  this._mp = $("<audio/>");

  return $(document).appendChild(this._mp);

}

musicPlayer.prototype.changeSource = function(_src) {

  this.pause();
  this._mp.src = _src;
  this._mp.load();
  this._src = _src;

}

musicPlayer.prototype.pause = function() {

  this._mp.pause();
  this._current_state = "paused";

}

musicPlayer.prototype.play = function() {

  this._mp.play();
  this._current_state = "playing";

}

musicPlayer.prototype.clearPlaylist = function() {

  this._play_list = [];

}

musicPlayer.prototype.addToPlaylist = function(_obj) {

  this._play_list.push(_obj);

}

musicPlayer.prototype.addPlaylist = function(_play_list) {

  this._play_list = _play_list;

}

musicPlayer.prototype.repeat = function() {

  this._mp.loop = (this._mp.loop === true?false:true);

}

musicPlayer.prototype.repeatAll = function() {

  this._repeat_all = (this._repeat_all === true?false:true);

}

musicPlayer.prototype.nextTrack = function() {

  this._play_index = this._play_index + 1;

  if (this._play_index >= this._play_list.length) {

    this._play_index = 0;

  }

  this.changeSource(this._play_list[this._play_index].filepath);
  this.play();

}

musicPlayer.prototype.previousTrack = function() {

  this._play_index = this._play_index - 1;

  if (this._play_index < 0) {

    this._play_index = this._play_list.length - 1;

  }

  this.changeSource(this._play_list[this._play_index].filepath);
  this.play();

}

musicPlayer.prototype.setup = function() {

  this.generatePlayer();

  $(this._mp).bind('volumechange', function() {

    console.log(this._mp.volume);

  })

  $(this._mp).bind('ended', function() {

    if (this.repeat === true) {

      return false;

    }

    if (this._repeat_all === true && this._play_index === this._play_list.length - 1) {

      this._play_index = -1;

    }

    this.nextTrack();

  })

}