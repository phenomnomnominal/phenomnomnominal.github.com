// Generated by CoffeeScript 1.3.3
(function() {
  var addEventListeners, audioContext, audioFile, canvasHeight, canvasWidth, channels, create, draw, drawAbsolute, drawEnvelope, getPitches, noteoff, noteon, scroll, selectNotes, threshold, transform, tune, tuner, update, zoom;

  audioFile = null;

  channels = [];

  drawAbsolute = false;

  drawEnvelope = false;

  noteon = false;

  noteoff = false;

  tune = false;

  audioContext = null;

  threshold = {
    on: null,
    off: null,
    yOn: null,
    drawYOn: null,
    yOff: null,
    drawYOff: null,
    drawY: null
  };

  zoom = {
    vert: 1,
    maxVert: 0,
    hor: 1,
    maxHor: 0
  };

  scroll = {
    x: 0,
    dx: 0,
    y: 0,
    dy: 0
  };

  canvasWidth = $('canvas:first').width();

  canvasHeight = $('canvas:first').height();

  create = {
    canvas: function(n) {
      var c, getThreshold, _i;
      for (c = _i = 0; 0 <= n ? _i < n : _i > n; c = 0 <= n ? ++_i : --_i) {
        $('body').append($('<canvas>', {
          unselectable: 'on'
        }));
      }
      $('body').promise().done(function() {
        return $(window).trigger('resize');
      });
      getThreshold = function(e) {
        var $canvas, resetThresholdButtons, val, y;
        if (noteon || noteoff) {
          $canvas = $(this);
          y = null;
          val = null;
          $('canvas').each(function(i, el) {
            var centre;
            if (el === $canvas[0]) {
              y = e.pageY - $canvas.position().top;
              centre = canvasHeight / 2;
              val = -((y - centre - scroll.y) * channels[i].max) / (centre * zoom.vert);
              return threshold.drawY = y;
            }
          });
          resetThresholdButtons = function() {
            $('.button').removeClass('click');
            $('canvas').unbind('click');
            noteon = false;
            noteoff = false;
            return threshold.drawY = null;
          };
          if (noteon) {
            $(this).unbind('click');
            $(this).click(function() {
              threshold.on = val;
              threshold.yOn = threshold.drawY;
              threshold.drawYOn = threshold.yOn;
              resetThresholdButtons();
              if (threshold.on && threshold.off) {
                return getPitches(selectNotes());
              }
            });
          }
          if (noteoff) {
            $(this).unbind('click');
            return $(this).click(function() {
              threshold.off = val;
              threshold.yOff = threshold.drawY;
              threshold.drawYOff = threshold.yOff;
              resetThresholdButtons();
              if (threshold.on && threshold.off) {
                return getPitches(selectNotes());
              }
            });
          }
        }
      };
      $('canvas').mousemove(getThreshold);
      $('canvas').mousedown(function(downE) {
        var down, prev;
        down = {
          x: scroll.x,
          y: scroll.y
        };
        prev = {
          x: null,
          y: null
        };
        $('canvas').unbind('mousemove');
        return $('canvas').mousemove(function(moveE) {
          var dx, dy;
          dx = downE.pageX - moveE.pageX;
          dy = downE.pageY - moveE.pageY;
          scroll.x = Math.min(down.x - dx, 0);
          scroll.x = Math.max(scroll.x, -((canvasWidth * zoom.hor) - canvasWidth));
          scroll.y = Math.min(down.y - dy, ((canvasHeight / 2) * zoom.vert) - (canvasHeight / 2));
          scroll.y = Math.max(scroll.y, -(((canvasHeight / 2) * zoom.vert) - (canvasHeight / 2)));
          if (!(prev.x != null)) {
            prev.x = downE.pageX;
          }
          if (!(prev.y != null)) {
            prev.y = downE.pageY;
          }
          if (scroll.x !== 0 || scroll.y !== 0) {
            scroll.dx = prev.x - moveE.pageX;
            scroll.dy = prev.y - moveE.pageY;
          } else {
            scroll.dx = 0;
            scroll.dy = 0;
          }
          prev.x = moveE.pageX;
          prev.y = moveE.pageY;
          return update.threshold.scroll();
        });
      });
      return $('canvas').mouseup(function() {
        $('canvas').unbind('mousemove');
        return $('canvas').mousemove(getThreshold);
      });
    },
    ui: function() {
      var absolute, chromatic, envelope, horZoomDiv, noteoffThres, noteonThres, topUI, vertZoomDiv, zoomHor, zoomVert;
      vertZoomDiv = $('<div>', {
        "class": 'container left',
        unselectable: 'on'
      });
      zoomVert = $('<div>', {
        "class": 'ui slide left',
        html: '&uarr;<br/><br/>z<br/>o<br/>o<br/>m<br/><br/>&darr;',
        unselectable: 'on'
      });
      vertZoomDiv.append(zoomVert);
      zoomVert.css({
        bottom: '0px',
        position: 'absolute'
      });
      $(zoomVert).draggable({
        containment: '.container.left',
        drag: function() {
          update.zoom($(this), 'VERT');
          update.scroll();
          return update.threshold.zoom();
        },
        stop: function() {
          return $(this).css({
            top: "auto",
            bottom: "" + (100 - (100 * ($(this).position().top + $(this).outerHeight(true))) / $(window).height()) + "%"
          });
        }
      });
      horZoomDiv = $('<div>', {
        "class": 'container bottom',
        unselectable: 'on'
      });
      zoomHor = $('<div>', {
        "class": 'ui slide bottom',
        html: '&larr; z o o m &rarr;',
        unselectable: 'on'
      });
      horZoomDiv.append(zoomHor);
      zoomHor.css({
        left: '0px',
        position: 'absolute'
      });
      $(zoomHor).draggable({
        containment: '.container.bottom',
        drag: function() {
          update.zoom($(this), 'HOR');
          return update.scroll();
        },
        stop: function() {
          return $(this).css({
            left: "auto",
            right: "" + (100 - (100 * ($(this).position().left + $(this).outerWidth(true))) / $(window).width()) + "%"
          });
        }
      });
      topUI = $('<ul>', {
        "class": 'container top'
      });
      absolute = $('<li>', {
        "class": 'ui switch top',
        unselectable: 'on',
        text: 'absolute value',
        click: function() {
          $('.button').not(this).removeClass('click');
          $('.switch').not(this).removeClass('click');
          $(this).toggleClass('click');
          drawAbsolute = !drawAbsolute;
          return drawEnvelope = false;
        }
      });
      envelope = $('<li>', {
        "class": 'ui switch top',
        unselectable: 'on',
        text: 'average envelope',
        click: function() {
          $('.button').not(this).removeClass('click');
          $('.switch').not(this).removeClass('click');
          $(this).toggleClass('click');
          drawEnvelope = !drawEnvelope;
          return drawAbsolute = false;
        }
      });
      noteonThres = $('<li>', {
        "class": 'ui button top',
        unselectable: 'on',
        text: 'note-on threshold',
        click: function() {
          $('.button').not(this).removeClass('click');
          $(this).toggleClass('click');
          $('canvas').unbind('click');
          threshold.drawY = null;
          noteon = !noteon;
          noteoff = false;
          return tune = false;
        }
      });
      noteoffThres = $('<li>', {
        "class": 'ui button top',
        unselectable: 'on',
        text: 'note-off threshold',
        click: function() {
          $('.button').not(this).removeClass('click');
          $(this).toggleClass('click');
          $('canvas').unbind('click');
          threshold.drawY = null;
          noteon = false;
          noteoff = !noteoff;
          return tune = false;
        }
      });
      chromatic = $('<li>', {
        "class": 'ui button top',
        unselectable: 'on',
        text: 'chromatic tuner',
        click: function() {
          $('.button').not(this).removeClass('click');
          $(this).toggleClass('click');
          $('canvas').unbind('click');
          threshold.drawY = null;
          noteon = false;
          noteoff = false;
          tune = true;
          return tuner();
        }
      });
      topUI.append(absolute, envelope, noteonThres, noteoffThres, chromatic);
      return $('body').append(vertZoomDiv, horZoomDiv, topUI);
    }
  };

  draw = function() {
    var c, centre, channel, colour, context, dx, endS, height, line, note, s, sampleShift, samples, samplesPerPixel, startS, step, width, x, y, _i, _j, _ref, _results;
    width = canvasWidth;
    height = canvasHeight;
    samples = audioFile.buffer.length;
    samplesPerPixel = (samples / width) / zoom.hor;
    sampleShift = -Math.floor(samplesPerPixel * scroll.x);
    dx = width / samples;
    _results = [];
    for (c = _i = 0, _ref = channels.length; 0 <= _ref ? _i < _ref : _i > _ref; c = 0 <= _ref ? ++_i : --_i) {
      centre = height / 2;
      if (drawAbsolute) {
        centre *= 2;
      }
      context = $('canvas')[c].getContext('2d');
      context.fillStyle = '#111';
      context.fillRect(0, 0, width, height);
      context.lineWidth = 0.5;
      channel = channels[c].normalise;
      if (drawAbsolute) {
        channel = channels[c].absolute;
      }
      if (drawEnvelope) {
        channel = channels[c].envelope;
      }
      startS = Math.max(sampleShift, 0);
      endS = Math.min((samples / zoom.hor) + sampleShift, samples);
      step = Math.max(Math.floor(samplesPerPixel), 1);
      context.strokeStyle = '#EEE';
      context.beginPath();
      context.moveTo(0 + scroll.x, centre + scroll.y);
      note = false;
      for (s = _j = startS; startS <= endS ? _j < endS : _j > endS; s = _j += step) {
        context.strokeStyle = '#EEE';
        x = Math.floor((dx * s) * zoom.hor + scroll.x);
        y = Math.floor(centre - ((channel[s] / channels[c].max) * zoom.vert) * centre + scroll.y);
        if (threshold.on && threshold.off) {
          if (channel[s] > threshold.on || note) {
            note = true;
            context.strokeStyle = '#FF0';
          }
          if (note && channel[s] < threshold.off) {
            note = false;
            context.strokeStyle = '#EEE';
          }
        }
        if (samplesPerPixel < 0.2) {
          context.fillStyle = '#00F';
          context.fillRect(x - 2.5, y - 2.5, 5, 5);
        }
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
        context.beginPath();
        context.moveTo(x, y);
      }
      context.lineTo(x + 10 - scroll.x, centre + scroll.y);
      context.lineTo(0 + scroll.x, centre + scroll.y);
      context.closePath();
      context.stroke();
      line = function(y, colour) {
        context.strokeStyle = colour;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(canvasWidth, y);
        context.closePath();
        return context.stroke();
      };
      if (threshold.on != null) {
        colour = '#08F';
        if (noteon) {
          colour = '#AAF';
        }
        line(threshold.drawYOn, colour);
      }
      if (threshold.off != null) {
        colour = '#F0F';
        if (noteoff) {
          colour = '#FAF';
        }
        line(threshold.drawYOff, colour);
      }
      if (threshold.drawY != null) {
        if (noteon) {
          colour = '#08F';
        } else if (noteoff) {
          colour = '#F0F';
        }
        _results.push(line(threshold.drawY, colour));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  getPitches = function(notes) {
    var audio, downSamples, f, fft, length, max, note, roundUpPow2, rounded, s, _i, _j, _k, _l, _len, _ref, _ref1, _ref2;
    roundUpPow2 = function(n) {
      n--;
      n |= n >> 1;
      n |= n >> 2;
      n |= n >> 4;
      n |= n >> 8;
      n |= n >> 16;
      return n++;
    };
    for (_i = 0, _len = notes.length; _i < _len; _i++) {
      note = notes[_i];
      length = note.off - note.on;
      rounded = roundUpPow2(length) + 1;
      fft = new FFT(rounded, audioFile.buffer.sampleRate / 4);
      audio = channels[1].audio.subarray(note.on, note.on + rounded);
      for (s = _j = 0, _ref = audio.length; 0 <= _ref ? _j < _ref : _j > _ref; s = 0 <= _ref ? ++_j : --_j) {
        audio[s] *= WindowFunction.Hamming(audio.length, s);
      }
      downSamples = [];
      for (s = _k = 0, _ref1 = audio.length; _k < _ref1; s = _k += 4) {
        audio[s / 4] = audio[s];
      }
      fft.forward(audio);
      max = _.reduce(fft.spectrum, (function(max, next) {
        if (Math.abs(next) > max) {
          return Math.abs(next);
        } else {
          return max;
        }
      }), 0);
      for (f = _l = 0, _ref2 = fft.spectrum.length; 0 <= _ref2 ? _l < _ref2 : _l > _ref2; f = 0 <= _ref2 ? ++_l : --_l) {
        if (fft.spectrum[f] === max) {
          console.log(f);
        }
      }
    }
  };

  selectNotes = function() {
    var channel, note, notes, playing, s, _i, _ref;
    notes = [];
    note = null;
    playing = false;
    channel = channels[1].envelope;
    for (s = _i = 0, _ref = channel.length; 0 <= _ref ? _i < _ref : _i > _ref; s = 0 <= _ref ? ++_i : --_i) {
      if (channel[s] >= threshold.on && !playing) {
        playing = true;
        note = {
          on: s
        };
      }
      if (playing && channel[s] < threshold.off) {
        playing = false;
        if (note.on != null) {
          note.off = s;
          notes.push(note);
          note = null;
        }
      }
    }
    return notes;
  };

  transform = {
    absolute: function(channel) {
      var s, _i, _len, _ref, _results;
      _ref = channel.audio;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        _results.push(Math.abs(s));
      }
      return _results;
    },
    envelope: function(channel) {
      var averageEnv, k, runningSum, s, windowLength, _i, _ref;
      averageEnv = (function() {
        var _i, _len, _ref, _results;
        _ref = channel.audio;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _results.push(s);
        }
        return _results;
      })();
      windowLength = 256;
      runningSum = _.reduce(channel.audio.subarray(0, windowLength), (function(sum, next) {
        return sum + Math.abs(next);
      }), 0);
      for (k = _i = windowLength, _ref = averageEnv.length; windowLength <= _ref ? _i < _ref : _i > _ref; k = windowLength <= _ref ? ++_i : --_i) {
        if (k !== windowLength) {
          runningSum -= Math.abs(channel.audio[k - windowLength - 1]);
          runningSum += Math.abs(channel.audio[k + windowLength]);
        }
        averageEnv[k] = runningSum / windowLength;
      }
      return averageEnv;
    },
    normalise: function(channel) {
      var s;
      channel.max = _.reduce(channel.audio, (function(max, next) {
        if (Math.abs(next) > max) {
          return Math.abs(next);
        } else {
          return max;
        }
      }), 0);
      channel.min = _.reduce(channel.audio, (function(min, next) {
        if (Math.abs(next) < min && next !== 0) {
          return Math.abs(next);
        } else {
          return min;
        }
      }), 1);
      return channel.normalise = (function() {
        var _i, _len, _ref, _results;
        _ref = channel.audio;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          s = _ref[_i];
          _results.push(s / channel.max);
        }
        return _results;
      })();
    }
  };

  update = {
    zoom: function($el, dir) {
      var center;
      if (dir === 'VERT') {
        center = ($el.position().top * 100) / ($(window).height() - $el.outerHeight(true));
        zoom.vert = (((100 - center) * zoom.maxVert) / 100) + 1;
      }
      if (dir === 'HOR') {
        center = ($el.position().left * 100) / ($(window).width() - $el.outerWidth(true));
        return zoom.hor = 1 + (zoom.maxHor - 1) * (((100 / Math.max(100 - center, 1)) - 1) / 100);
      }
    },
    scroll: function() {
      scroll.y = Math.min(scroll.y, ((canvasHeight / 2) * zoom.vert) - (canvasHeight / 2));
      scroll.y = Math.max(scroll.y, -(((canvasHeight / 2) * zoom.vert) - (canvasHeight / 2)));
      return scroll.x = Math.max(scroll.x, -((canvasWidth * zoom.hor) - canvasWidth));
    },
    threshold: {
      zoom: function() {
        var scaleY;
        scaleY = function(y) {
          return (canvasHeight / 2) - (((canvasHeight / 2) - y) * zoom.vert) + scroll.y;
        };
        if (threshold.yOff != null) {
          threshold.drawYOff = scaleY(threshold.yOff);
        }
        if (threshold.yOn != null) {
          return threshold.drawYOn = scaleY(threshold.yOn);
        }
      },
      scroll: function() {
        if (threshold.yOff != null) {
          threshold.drawYOff = threshold.drawYOff - scroll.dy;
        }
        if (threshold.yOn != null) {
          return threshold.drawYOn = threshold.drawYOn - scroll.dy;
        }
      }
    }
  };

  tuner = function() {
    var error, options, success, toString;
    navigator.getUserMedia || (navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia);
    toString = function() {
      return 'audio';
    };
    options = {
      audio: true,
      video: false,
      toString: toString
    };
    success = function(stream) {
      var analyser, canvas, context, count, data, noise, src;
      src = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.smoothingTimeConstant = 0;
      src.connect(analyser);
      canvas = $('<canvas>');
      canvas[0].height = $(window).height() - 100;
      canvas[0].width = $(window).width() - 100;
      $('body').append(canvas);
      context = canvas[0].getContext('2d');
      noise = new Uint8Array(analyser.fftSize / 2);
      count = 0;
      data = function() {
        var arr, fft, i, newNoise, s, time, _i, _j, _k, _ref, _ref1, _ref2, _results;
        count++;
        if (count < 10) {
          newNoise = new Uint8Array(analyser.fftSize / 2);
          analyser.getByteFrequencyData(newNoise);
          for (i = _i = 0, _ref = analyser.fftSize; _i < _ref; i = _i += 2) {
            noise[i / 2] = (noise[i] + newNoise[i]) / 2;
          }
        }
        arr = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(arr);
        time = [];
        for (s = _j = 0, _ref1 = arr.length; _j < _ref1; s = _j += 2) {
          time[s / 2] = arr[s];
        }
        fft = new FFT(analyser.fftSize / 2, context.sampleRate / 2);
        fft.forward(time);
        context.clearRect(0, 0, canvas[0].width, canvas[0].height);
        context.fillStyle = '#EEE';
        _results = [];
        for (i = _k = 0, _ref2 = fft.spectrum.length; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          _results.push(context.fillRect(i * 2, canvas[0].height - 10, 1.5, -Math.pow(Math.abs(fft.spectrum[i]), 2)));
        }
        return _results;
      };
      return setInterval(data, 20);
    };
    error = function(e) {
      return console.log(e);
    };
    return navigator.getUserMedia(options, success, error);
  };

  $(function() {
    var $audioFileInput, $win, analyser, audioSrc;
    if (!window.AudioContext) {
      if (!window.webkitAudioContext) {
        throw Error('SHITTY BROWSER');
      }
      window.AudioContext = window.webkitAudioContext;
    }
    $win = $(window);
    $audioFileInput = $('input');
    addEventListeners();
    $win.trigger('resize');
    audioSrc = null;
    analyser = null;
    return $audioFileInput.change(function() {
      var file, reader;
      $audioFileInput.remove();
      file = this.files[0];
      if (file) {
        reader = new FileReader();
        reader.onload = function(event) {
          var error, success;
          audioContext = new AudioContext();
          success = function(event) {
            var c, channel, max, min, _i, _ref;
            audioFile = audioContext.createBufferSource();
            audioFile.buffer = event;
            for (c = _i = 0, _ref = audioFile.buffer.numberOfChannels; 0 <= _ref ? _i < _ref : _i > _ref; c = 0 <= _ref ? ++_i : --_i) {
              channels[c] = {
                audio: audioFile.buffer.getChannelData(c)
              };
              channels[c].absolute = transform.absolute(channels[c]);
              channels[c].envelope = transform.envelope(channels[c]);
              channels[c].normalise = transform.normalise(channels[c]);
            }
            create.ui();
            max = Math.max.apply(Math, (function() {
              var _j, _len, _results;
              _results = [];
              for (_j = 0, _len = channels.length; _j < _len; _j++) {
                channel = channels[_j];
                _results.push(channel.max);
              }
              return _results;
            })());
            min = Math.min.apply(Math, (function() {
              var _j, _len, _results;
              _results = [];
              for (_j = 0, _len = channels.length; _j < _len; _j++) {
                channel = channels[_j];
                _results.push(channel.min);
              }
              return _results;
            })());
            return zoom = {
              vert: 1,
              hor: 1,
              maxVert: max / min / 50,
              maxHor: audioFile.buffer.length / 250
            };
          };
          error = function(event) {
            return console.log(event);
          };
          return audioContext.decodeAudioData(event.target.result, success, error);
        };
        reader.onerror = function(event) {
          throw Error;
        };
        return reader.readAsArrayBuffer(file);
      }
    });
  });

  addEventListeners = function() {
    return $(window).resize(function() {
      var c, canvases, _i;
      canvases = $('canvas').length;
      if (canvases > 0) {
        canvasWidth = $(window).width();
        canvasHeight = Math.floor(($(window).height() / canvases) - 5);
        for (c = _i = 0; 0 <= canvases ? _i < canvases : _i > canvases; c = 0 <= canvases ? ++_i : --_i) {
          $('canvas')[c].width = canvasWidth;
          $('canvas')[c].height = canvasHeight;
        }
        update.zoom($('.slide.left'), 'VERT');
        update.zoom($('.slide.bottom'), 'HOR');
        update.scroll();
        return update.threshold.zoom();
      }
    });
  };

}).call(this);
