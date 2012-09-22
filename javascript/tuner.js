// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root;

  Tuner = function() {
    var audioContext, error, fft, filter, hamming, options, success;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    hamming = new WindowFunction(DSP.HAMMING);
    filter = new IIRFilter2(DSP.HIGHPASS, 25, 0, 44100);
    fft = new FFT(2048, audioContext.sampleRate / 8);
    options = {
      audio: true,
      video: false
    };
    success = function(stream) {
      var analyser, canvas, context, data, src;
      src = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      src.connect(analyser);
      $('.tuner').removeClass('hidden');
      canvas = $('#tuner_canvas')[0];
      canvas.height = $('.tuner').height();
      canvas.width = $('.tuner').width();
      context = canvas.getContext('2d');
      data = function() {
        var arr, i, s, time, width, _i, _j, _ref, _ref1, _results;
        arr = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(arr);
        console.log(arr.length);
        hamming.process(arr);
        filter.process(arr);
        time = [];
        for (s = _i = 0, _ref = arr.length; _i < _ref; s = _i += 2) {
          time.push(arr[s]);
          time.push(0);
        }
        fft.forward(time);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#EEE';
        width = canvas.width / (fft.spectrum.length / 2);
        _results = [];
        for (i = _j = 10, _ref1 = fft.spectrum.length / 2; 10 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 10 <= _ref1 ? ++_j : --_j) {
          _results.push(context.fillRect(width * i + 1, canvas.height - 10, width, -Math.pow(5 * Math.abs(fft.spectrum[i]), 2)));
        }
        return _results;
      };
      return setInterval(data, 100);
    };
    error = function(e) {
      return console.log(e);
    };
    return navigator.getUserMedia(options, success, error);
  };

  $(function() {
    if (!window.AudioContext) {
      if (!window.webkitAudioContext) {
        throw Error('SHITTY BROWSER');
      }
      return window.AudioContext = window.webkitAudioContext;
    }
  });

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Tuner = Tuner;

}).call(this);
