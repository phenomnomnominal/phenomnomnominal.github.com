// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root;

  Tuner = function() {
    var analyser, audioContext, buffer, bufferFillSize, bufferFiller, downsampleRate, error, fft, fftSize, gauss, hp, i, lp, options, sampleRate, success, _i;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    sampleRate = audioContext.sampleRate;
    downsampleRate = sampleRate / 4;
    fftSize = 8192;
    fft = new FFT(fftSize, downsampleRate);
    gauss = new WindowFunction(DSP.GAUSS);
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
    bufferFillSize = 2048;
    bufferFiller = audioContext.createJavaScriptNode(bufferFillSize, 1, 1);
    bufferFiller.onaudioprocess = function(e) {
      var input, _j, _k, _ref, _ref1, _results;
      for (i = _j = bufferFillSize, _ref = buffer.length; bufferFillSize <= _ref ? _j < _ref : _j > _ref; i = bufferFillSize <= _ref ? ++_j : --_j) {
        buffer[i - bufferFillSize] = buffer[i];
      }
      input = e.inputBuffer.getChannelData(0);
      _results = [];
      for (i = _k = 0, _ref1 = input.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; i = 0 <= _ref1 ? ++_k : --_k) {
        _results.push(buffer[buffer.length - bufferFillSize + i] = input[i]);
      }
      return _results;
    };
    analyser = audioContext.createAnalyser();
    options = {
      audio: true,
      video: false
    };
    success = function(stream) {
      var canvas, context, data, maxFreq, maxTime, noiseCount, noiseThreshold, parabolicInterp, src;
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
      maxTime = 0;
      maxFreq = 0;
      noiseCount = 0;
      noiseThreshold = -Infinity;
      parabolicInterp = function(left, peak, right) {
        return (0.5 * ((left.y - right.y) / (left.y - (2 * peak.y) + right.y)) + peak.x) * (sampleRate / fftSize);
      };
      data = function() {
        var bufferCopy, downsampled, f, freqWidth, left, newMaxTime, p, peak, peaks, right, s, spectrumPoints, timeWidth, upsampled, x, _j, _k, _l, _len, _m, _n, _ref, _ref1, _ref2, _results;
        bufferCopy = (function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = buffer.length; _j < _len; _j++) {
            s = buffer[_j];
            _results.push(s);
          }
          return _results;
        })();
        gauss.process(bufferCopy);
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
        newMaxTime = _.reduce(buffer, (function(max, next) {
          if (Math.abs(next) > max) {
            return Math.abs(next);
          } else {
            return max;
          }
        }), -Infinity);
        maxTime = newMaxTime > maxTime ? newMaxTime : maxTime;
        context.fillStyle = '#EEE';
        timeWidth = (canvas.width - 100) / upsampled.length;
        for (i = _l = 0, _ref1 = upsampled.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; i = 0 <= _ref1 ? ++_l : --_l) {
          context.fillRect(timeWidth * i, canvas.height / 2, timeWidth, -(canvas.height / 2) * (buffer[i] / maxTime));
        }
        if (noiseCount < 10) {
          noiseThreshold = _.reduce(fft.spectrum, (function(max, next) {
            if (next > max) {
              return next;
            } else {
              return max;
            }
          }), noiseThreshold);
          noiseCount++;
        }
        spectrumPoints = (function() {
          var _m, _ref2, _results;
          _results = [];
          for (x = _m = 0, _ref2 = fft.spectrum.length; 0 <= _ref2 ? _m < _ref2 : _m > _ref2; x = 0 <= _ref2 ? ++_m : --_m) {
            _results.push({
              x: x,
              y: fft.spectrum[x]
            });
          }
          return _results;
        })();
        spectrumPoints.sort(function(a, b) {
          if (a.y > b.y) {
            return -1;
          } else if (a.y === b.y) {
            return 0;
          }
          if (a.y < b.y) {
            return 1;
          }
        });
        peaks = [];
        for (p = _m = 0; _m < 10; p = ++_m) {
          if (spectrumPoints[p] > noiseThreshold * 2) {
            peaks.push(spectrumPoints[p]);
          }
        }
        if (peaks.length > 0) {
          peaks.sort(function(a, b) {
            if (a.x < b.x) {
              return -1;
            } else if (a.x === b.x) {
              return 0;
            } else if (a.x > b.x) {
              return 1;
            }
          });
          peak = peaks[0];
          left = {
            x: peak.x - 1,
            y: fft.spectrum[peak.x - 1]
          };
          right = {
            x: peak.x + 1,
            y: fft.spectrum[peak.x + 1]
          };
          f = parabolicInterp(left, peak, right);
          console.log('F: ', f);
        }
        context.fillStyle = '#F77';
        freqWidth = (canvas.width - 100) / (fft.spectrum.length / 4);
        _results = [];
        for (i = _n = 10, _ref2 = (fft.spectrum.length / 2) - 10; 10 <= _ref2 ? _n < _ref2 : _n > _ref2; i = 10 <= _ref2 ? ++_n : --_n) {
          _results.push(context.fillRect(freqWidth * i, canvas.height / 2, freqWidth, -Math.pow(5 * fft.spectrum[i], 2)));
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
