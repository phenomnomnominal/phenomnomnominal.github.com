// Generated by CoffeeScript 1.3.3
(function() {
  var Tuner, root,
    __hasProp = {}.hasOwnProperty;

  Tuner = function() {
    var analyser, audioContext, buffer, bufferFillSize, bufferFiller, downsampleRate, fft, fftSize, frequencies, gauss, getPitch, hp, i, lp, sampleRate, success, _i;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
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
      var b, input, _j, _k, _ref, _ref1, _results;
      for (b = _j = bufferFillSize, _ref = buffer.length; bufferFillSize <= _ref ? _j < _ref : _j > _ref; b = bufferFillSize <= _ref ? ++_j : --_j) {
        buffer[b - bufferFillSize] = buffer[b];
      }
      input = e.inputBuffer.getChannelData(0);
      _results = [];
      for (b = _k = 0, _ref1 = input.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; b = 0 <= _ref1 ? ++_k : --_k) {
        _results.push(buffer[buffer.length - bufferFillSize + b] = input[b]);
      }
      return _results;
    };
    frequencies = {
      'A0': 27.5,
      'A1': 55,
      'A2': 110,
      'A3': 220,
      'A4': 440,
      'A5': 880,
      'A6': 1760,
      'A7': 3520.00,
      'A#0': 29.1352,
      'A#1': 58.2705,
      'A#2': 116.541,
      'A#3': 233.082,
      'A#4': 466.164,
      'A#5': 932.328,
      'A#6': 1864.66,
      'A#7': 3729.31,
      'B0': 30.8677,
      'B1': 61.7354,
      'B2': 123.471,
      'B3': 246.942,
      'B4': 493.883,
      'B5': 987.767,
      'B6': 1975.53,
      'B7': 3951.07,
      'C1': 32.7032,
      'C2': 65.4064,
      'C3': 130.813,
      'C4': 261.626,
      'C5': 523.251,
      'C6': 1046.50,
      'C7': 2093,
      'C8': 4186.01,
      'C#1': 34.6478,
      'C#2': 69.2957,
      'C#3': 138.591,
      'C#4': 277.183,
      'C#5': 554.365,
      'C#6': 1108.73,
      'C#7': 2217.46,
      'D1': 36.7081,
      'D2': 73.4162,
      'D3': 146.832,
      'D4': 293.665,
      'D5': 587.330,
      'D6': 1174.66,
      'D7': 2349.32,
      'D#1': 38.8909,
      'D#2': 77.7817,
      'D#3': 155.563,
      'D#4': 311.127,
      'D#5': 622.254,
      'D#6': 1244.51,
      'D#7': 2489.02,
      'E1': 41.2034,
      'E2': 82.4069,
      'E3': 164.814,
      'E4': 329.628,
      'E5': 659.255,
      'E6': 1318.51,
      'E7': 2637.02,
      'F1': 43.6563,
      'F2': 87.3071,
      'F3': 174.614,
      'F4': 349.228,
      'F5': 698.456,
      'F6': 1396.91,
      'F7': 2793.83,
      'F#1': 46.2493,
      'F#2': 92.4986,
      'F#3': 184.997,
      'F#4': 369.994,
      'F#5': 739.989,
      'F#6': 1479.98,
      'F#7': 2959.96,
      'G1': 48.9994,
      'G2': 97.9989,
      'G3': 195.998,
      'G4': 391.995,
      'G5': 783.991,
      'G6': 1567.98,
      'G7': 3135.96,
      'G#1': 51.9131,
      'G#': 103.826,
      'G#3': 207.652,
      'G#4': 415.305,
      'G#5': 830.609,
      'G#6': 1661.22,
      'G#7': 3322.44
    };
    getPitch = function(freq) {
      var diff, key, minDiff, note, val;
      minDiff = Infinity;
      diff = Infinity;
      for (key in frequencies) {
        if (!__hasProp.call(frequencies, key)) continue;
        val = frequencies[key];
        if (Math.abs(freq - val) < minDiff) {
          minDiff = Math.abs(freq - val);
          diff = freq - val;
          note = key;
        }
      }
      return [note, diff];
    };
    success = function(stream) {
      var canvas, context, data, maxFreq, maxPeaks, maxTime, noiseCount, noiseThreshold, parabolicInterp, src;
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
      maxPeaks = 0;
      parabolicInterp = function(left, peak, right) {
        return (0.5 * ((left.y - right.y) / (left.y - (2 * peak.y) + right.y)) + peak.x) * (sampleRate / fftSize);
      };
      data = function() {
        var b, bufferCopy, diff, downsampled, f, firstFreq, freq, freqWidth, left, newMaxTime, note, p, peak, peaks, q, right, s, secondFreq, spectrumPoints, thirdFreq, timeWidth, upsampled, x, _j, _k, _l, _len, _m, _n, _o, _p, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _results;
        bufferCopy = (function() {
          var _j, _len, _results;
          _results = [];
          for (_j = 0, _len = buffer.length; _j < _len; _j++) {
            b = buffer[_j];
            _results.push(b);
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
        for (s = _l = 0, _ref1 = upsampled.length; 0 <= _ref1 ? _l < _ref1 : _l > _ref1; s = 0 <= _ref1 ? ++_l : --_l) {
          context.fillRect(timeWidth * s, canvas.height / 2, timeWidth, -(canvas.height / 2) * (buffer[s] / maxTime));
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
          for (x = _m = 0, _ref2 = fft.spectrum.length / 4; 0 <= _ref2 ? _m < _ref2 : _m > _ref2; x = 0 <= _ref2 ? ++_m : --_m) {
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
        for (p = _m = 0; _m < 8; p = ++_m) {
          if (spectrumPoints[p].y > noiseThreshold * 5) {
            peaks.push(spectrumPoints[p]);
          }
        }
        if (peaks.length > 0) {
          for (p = _n = 0, _ref2 = peaks.length; 0 <= _ref2 ? _n < _ref2 : _n > _ref2; p = 0 <= _ref2 ? ++_n : --_n) {
            if (peaks[p] != null) {
              for (q = _o = 0, _ref3 = peaks.length; 0 <= _ref3 ? _o < _ref3 : _o > _ref3; q = 0 <= _ref3 ? ++_o : --_o) {
                if (p !== q && (peaks[q] != null)) {
                  if (Math.abs(peaks[p].x - peaks[q].x) < 5) {
                    peaks[q] = null;
                  }
                }
              }
            }
          }
          peaks = (function() {
            var _len1, _p, _results;
            _results = [];
            for (_p = 0, _len1 = peaks.length; _p < _len1; _p++) {
              p = peaks[_p];
              if (p != null) {
                _results.push(p);
              }
            }
            return _results;
          })();
          maxPeaks = maxPeaks < peaks.length ? peaks.length : maxPeaks;
          peak = null;
          peaks.sort(function(a, b) {
            return a.x - b.x;
          });
          firstFreq = peaks[0].x * (sampleRate / fftSize);
          if (peaks.length > 1) {
            secondFreq = peaks[1].x * (sampleRate / fftSize);
            if ((1.4 < (_ref4 = firstFreq / secondFreq) && _ref4 < 1.6)) {
              peak = peaks[1];
            }
          }
          if (peaks.length > 2) {
            thirdFreq = peaks[2].x * (sampleRate / fftSize);
            if ((1.4 < (_ref5 = firstFreq / thirdFreq) && _ref5 < 1.6)) {
              peak = peaks[2];
            }
          }
          if (peaks.length > 1 || maxPeaks === 1) {
            if (!(peak != null)) {
              peak = peaks[0];
            }
            left = {
              x: peak.x - 1,
              y: fft.spectrum[peak.x - 1]
            };
            right = {
              x: peak.x + 1,
              y: fft.spectrum[peak.x + 1]
            };
            freq = parabolicInterp(left, peak, right);
            _ref6 = getPitch(freq), note = _ref6[0], diff = _ref6[1];
            console.log('Note: ', note);
            console.log('Diff: ', diff);
          }
        } else {
          maxPeaks = 0;
        }
        console.log('MAX PEAKS: ', maxPeaks);
        context.fillStyle = '#F77';
        freqWidth = (canvas.width - 100) / (fft.spectrum.length / 4);
        _results = [];
        for (f = _p = 10, _ref7 = (fft.spectrum.length / 4) - 10; 10 <= _ref7 ? _p < _ref7 : _p > _ref7; f = 10 <= _ref7 ? ++_p : --_p) {
          _results.push(context.fillRect(freqWidth * f, canvas.height / 2, freqWidth, -Math.pow(1e4 * fft.spectrum[f], 2)));
        }
        return _results;
      };
      return setInterval(data, 100);
    };
    return navigator.getUserMedia({
      audio: true
    }, success, (function(e) {
      throw e;
    }));
  };

  $(function() {
    if (!window.AudioContext) {
      if (!window.webkitAudioContext) {
        alert('THIS TUNER REQUIRES THE LATEST BUILD OF CHROME CANARY (23/09/2012) ON MAC WITH "Web Audio Input" ENABLED IN chrome://flags.');
      }
      window.AudioContext = window.webkitAudioContext;
    }
    return $(window).resize(function() {
      var canvas;
      canvas = $('#tuner_canvas')[0];
      canvas.height = $('.tuner').height();
      return canvas.width = $('.tuner').width();
    });
  });

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Tuner = Tuner;

}).call(this);
