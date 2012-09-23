// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root;

  Tuner = function() {
    var analyser, audioContext, buffer, bufferFillSize, bufferFiller, downsampleRate, error, fft, fftSize, hamming, hp, i, lp, options, sampleRate, success, _i;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    downsampleRate = 8000;
    fftSize = 16384;
    fft = new FFT(fftSize, downsampleRate);
    hamming = new WindowFunction(DSP.HAMMING);
    lp = audioContext.createBiquadFilter();
    lp.type = lp.LOWPASS;
    lp.frequency = 20;
    lp.Q = 0.1;
    hp = audioContext.createBiquadFilter();
    hp.type = hp.HIGHPASS;
    hp.frequency = 4000;
    hp.Q = 0.1;
    buffer = [];
    for (i = _i = 0; 0 <= fftSize ? _i < fftSize : _i > fftSize; i = 0 <= fftSize ? ++_i : --_i) {
      buffer[i] = 0;
    }
    bufferFillSize = 1024;
    bufferFiller = audioContext.createJavaScriptNode(bufferFillSize, 1, 1);
    bufferFiller.onaudioprocess = function(e) {
      var input, _j, _k, _ref, _ref1, _results;
      for (i = _j = bufferFillSize, _ref = buffer.length; bufferFillSize <= _ref ? _j < _ref : _j > _ref; i = bufferFillSize <= _ref ? ++_j : --_j) {
        buffer[i - bufferFillSize] = buffer[i];
      }
      input = e.inputBuffer.getChannelData(0);
      _results = [];
      for (i = _k = 0, _ref1 = input.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        _results.push(buffer[buffer.length - (bufferFillSize + i)] = input[i]);
      }
      return _results;
    };
    analyser = audioContext.createAnalyser();
    options = {
      audio: true,
      video: false
    };
    success = function(stream) {
      var canvas, context, data, fillBuffer, noise, noiseCount, src;
      src = audioContext.createMediaStreamSource(stream);
      src.connect(lp);
      lp.connect(hp);
      hp.connect(bufferFiller);
      bufferFiller.connect(analyser);
      $('.tuner').removeClass('hidden');
      canvas = $('#tuner_canvas')[0];
      canvas.height = $('.tuner').height();
      canvas.width = $('.tuner').width();
      context = canvas.getContext('2d');
      noise = [];
      noiseCount = 0;
      fillBuffer = function() {};
      data = function() {
        var average, f, mag2db, s, upsampled, width, _j, _k, _l, _m, _ref, _ref1, _ref2, _ref3, _ref4, _results, _results1;
        hamming.process(buffer);
        upsampled = [];
        for (s = _j = 0, _ref = buffer.length; 0 <= _ref ? _j < _ref : _j > _ref; s = 0 <= _ref ? ++_j : --_j) {
          upsampled.push(buffer[s]);
        }
        fft.forward(upsampled);
        if (noiseCount < 10) {
          for (f = _k = 0, _ref1 = fft.spectrum.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; f = 0 <= _ref1 ? ++_k : --_k) {
            if ((_ref2 = noise[f]) == null) {
              noise[f] = [];
            }
            noise[f].push(fft.spectrum[f]);
          }
          return noiseCount++;
        } else if (noiseCount === 10) {
          noiseCount++;
          average = function(arr) {
            return (_.reduce(arr, (function(sum, next) {
              return sum + next;
            }), 0)) / arr.length;
          };
          _results = [];
          for (f = _l = 0, _ref3 = fft.spectrum.length; 0 <= _ref3 ? _l < _ref3 : _l > _ref3; f = 0 <= _ref3 ? ++_l : --_l) {
            _results.push(noise[f] = average(noise[f]));
          }
          return _results;
        } else {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.fillStyle = '#EEE';
          width = (canvas.width - 100) / (fft.spectrum.length - 20);
          mag2db = function(n) {
            return 20 * (Math.log(n) / Math.log(10));
          };
          _results1 = [];
          for (i = _m = 10, _ref4 = fft.spectrum.length - 10; 10 <= _ref4 ? _m < _ref4 : _m > _ref4; i = 10 <= _ref4 ? ++_m : --_m) {
            _results1.push(context.fillRect(width * i + 1, canvas.height - 10, width, -Math.abs(mag2dg(fft.spectrum[i] - noise[i]))));
          }
          return _results1;
        }
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
