document.addEventListener('DOMContentLoaded', function() {
  var WebAudioLoader = require("webaudioloader"); // import the audio loader
  
  // initialize variables for later use
  var audioSource;
  var audioLength;
  var audioLoaded = false;
  var reindeer;
  var baseFps;
  var numFrames = 7;
  var baseAcceleration;
  var reindeerSelector = '#reindeer';
  
  var audioContext = new (window.AudioContext || window.webkitAudioContext)(); // define the audio context

  var options = {
    context : audioContext,
    cache : true,
    maxCacheSize : 2000,
    onprogress : function (event){
      console.log('Loading some files...', event.loaded/event.total);
    }
  }

  var wal = new WebAudioLoader(options); 
  
  wal.load('audio.wav', {
    onload : function (err, buffer){
      if (!err) {
        console.log('Loaded file of duration', buffer.duration);
        
        // remove the loader and show the reindeer
        document.getElementById('loader').style.display = 'none';
        document.getElementById('reindeer-wrapper').style.display = 'block';
        
        var startPoint = 0.5; // start the audio here to skip the noise in the beginning
        audioLength = buffer.duration - startPoint;
        
        // initialize our audio
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = buffer;
        audioSource.connect(audioContext.destination);
        audioSource.loop = true;
        audioSource.loopStart = startPoint;
        audioSource.loopEnd = buffer.duration;
        audioSource.playbackRate.value = 1;
        
        // load the animation
        var reindeerElement = document.querySelector(reindeerSelector);
        baseFps = (numFrames/parseInt(buffer.duration));
        reindeer = new Motio(reindeerElement, {
          fps: baseFps,
          frames: numFrames
        });
        
        // start the audio and animation when the button is clicked
        document.getElementById('play').addEventListener('click', function(e) {
          audioSource.start(0, startPoint);
          reindeer.play();
        });
        
        audioLoaded = true;
      }
      else {
        console.log(err);
      }
    },
  });
  
  if (window.DeviceMotionEvent) { // device supports motion
    window.addEventListener('devicemotion', function(event) {
      if (audioLoaded) { 
        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        var z = event.accelerationIncludingGravity.z;
        if (x && y && z) { // the device is actually capturing motion
          console.log('Motion captured');
          
          var netAcceleration = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2));
          
          // capture the first acceleration to use as a base to determine the new playback rate
          if (typeof baseAcceleration === 'undefined') baseAcceleration = netAcceleration;

          var newPlaybackRate = (netAcceleration/(baseAcceleration)).toFixed(1); // only use 1 significant digit
          
          audioSource.playbackRate.value = newPlaybackRate;
          reindeer.set('fps', newPlaybackRate*baseFps);
        }
      }  
    });
  }
});