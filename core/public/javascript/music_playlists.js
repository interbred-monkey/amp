$(function() {
  


})

var createVisibleTrackList = function(el) {

  var pli = $('[song-row]').index(el);
  music_player.updatePlayIndex(pli);

  var pl = [];

  $('[song-row]').each(function(li, sre) {

    pl.push(htmlTrackData(sre));

  })

  music_player.addPlaylist(pl);
  return;

}

var htmlTrackData = function(el) {

  track_data = {};
  track_data.src = $(el).attr('media');
  track_data.img = $(el).find('div:eq(0) div:eq(1) img').attr('src');
  track_data.title = $(el).children('div:eq(1)').children('span').text();
  track_data.artist = $(el).children('div:eq(3)').children('span').text();

  return track_data;

}