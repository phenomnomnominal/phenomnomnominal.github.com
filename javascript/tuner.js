// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root;

  Tuner = function() {
    var analyser, audioContext, buffer, bufferFillSize, bufferFiller, downsampleRate, error, fft, fftSize, hamming, hp, i, lp, options, sampleRate, success, _i;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    downsampleRate = sampleRate / 4;
    fftSize = 8192;
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
      var input, output, _j, _k, _ref, _ref1;
      for (i = _j = bufferFillSize, _ref = buffer.length; bufferFillSize <= _ref ? _j < _ref : _j > _ref; i = bufferFillSize <= _ref ? ++_j : --_j) {
        buffer[i - bufferFillSize] = buffer[i];
      }
      input = e.inputBuffer.getChannelData(0);
      for (i = _k = 0, _ref1 = input.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        buffer[buffer.length - bufferFillSize + i] = input[i];
      }
      return output = e.outputBuffer.getChannelData(0);
    };
    analyser = audioContext.createAnalyser();
    options = {
      audio: true,
      video: false
    };
    success = function(stream) {
      var canvas, context, data, fillBuffer, maxFreq, maxTime, noise, noiseCount, src;
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
      maxTime = -Infinity;
      maxFreq = -Infinity;
      noise = [];
      noiseCount = 0;
      fillBuffer = function() {};
      data = function() {
        var bufferCopy, count, downsampled, freqWidth, index, newMaxTime, s, timeWidth, upsampled, _j, _k, _l, _len, _m, _ref, _ref1, _ref2, _results;
        bufferCopy = (function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = buffer.length; _j < _len; _j++) {
            s = buffer[_j];
            _results.push(s);
          }
          return _results;
        })();
        hamming.process(bufferCopy);
        downsampled = [];
        for (s = _j = 0, _ref = bufferCopy.length; _j < _ref; s = _j += 4) {
          downsampled.push(bufferCopy[s]);
        }
        upsampled = [];
        for (_k = 0, _len = downsampled.length; _k < _len; _k++) {
          s = downsampled[_k];
          upsampled.push(s);
          upsampled.push(0);
          upsampled.push(0);
          upsampled.push(0);
        }
        fft.forward(upsampled);
        context.clearRect(0, 0, canvas.width, canvas.height);
        newMaxTime = _.reduce(upsampled, (function(max, next) {
          if (Math.abs(next) > max) {
            return Math.abs(next);
          } else {
            return max;
          }
        }), 0);
        maxTime = newMaxTime > maxTime ? newMaxTime : maxTime;
        context.fillStyle = '#EEE';
        timeWidth = (canvas.width - 100) / upsampled.length;
        for (i = _l = 0, _ref1 = upsampled.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
          context.fillRect(timeWidth * i, canvas.height / 2, timeWidth, -(canvas.height / 2) * (upsampled[i] / maxTime));
        }
        count = -1;
        index = 0;
        maxFreq = _.reduce(fft.spectrum, (function(max, next) {
          index++;
          if (Math.log(next) > max) {
            index = count;
            return Math.abs(next);
          } else {
            return max;
          }
        }), 0);
        console.log(index);
        context.fillStyle = '#F77';
        freqWidth = (canvas.width - 100) / (fft.spectrum.length / 4);
        _results = [];
        for (i = _m = 10, _ref2 = (fft.spectrum.length / 2) - 10; 10 <= _ref2 ? _m < _ref2 : _m > _ref2; i = 10 <= _ref2 ? ++_m : --_m) {
          _results.push(context.fillRect(freqWidth * i, canvas.height / 2, freqWidth, -(canvas.height / 2) * (Math.log(fft.spectrum[i]) / maxFreq)));
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
