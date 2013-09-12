// YouTube Functions

var yt_video_player = "";

// API ready
function onYouTubeIframeAPIReady() {
}

var makeYtVideoPlayer = function(params) {

  var ytp = new YT.Player(params.container, {
    height: params.height,
    width: params.width,
    playerVars: {
      "controls": params.controls,
      "autoplay": params.autoplay
    },
    videoId: params.video_id,
    events: {
      'onStateChange': ytStateChange,
      'onError': ytError
    }
  });

  console.log(ytp);

  return ytp;

}

var ytStateChange = function() {
  console.log("something");
}

var ytError = function() {
  console.log("error");
}