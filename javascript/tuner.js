// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root;

  Tuner = function() {
    var audioContext, buffer, downsampleRate, downsamplingFactor, error, fft, hamming, hp, lp, options, sampleRate, success;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    downsamplingFactor = 8;
    downsampleRate = sampleRate / downsamplingFactor;
    hamming = new WindowFunction(DSP.HAMMING);
    hp = new IIRFilter2(DSP.HIGHPASS, 20, 0.1, sampleRate);
    lp = new IIRFilter2(DSP.LOWPASS, 8000, 0.1, sampleRate);
    fft = new FFT(16384, downsampleRate);
    buffer = [];
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
        var downsampled, i, mag2db, s, time, width, _i, _j, _ref, _ref1, _results;
        time = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(time);
        hamming.process(time);
        downsampled = [];
        for (s = _i = 0, _ref = time.length; 0 <= _ref ? _i < _ref : _i > _ref; s = _i += downsamplingFactor) {
          downsampled.push(time[s]);
        }
        fft.forward(downsampled);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#EEE';
        width = (canvas.width - 100) / (fft.spectrum.length - 20);
        mag2db = function(n) {
          return 20 * (Math.log(n) / Math.log(10));
        };
        _results = [];
        for (i = _j = 10, _ref1 = fft.spectrum.length - 10; 10 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 10 <= _ref1 ? ++_j : --_j) {
          _results.push(context.fillRect(width * i + 1, canvas.height - 10, width, -mag2db(fft.spectrum[i])));
        }
        return _results;
      };
      return setInterval(data, 25);
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
