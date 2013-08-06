// Generated by CoffeeScript 1.6.2
(function() {
  (typeof exports !== "undefined" && exports !== null ? exports : this).Events = (function() {
    var addEventListener, get, init, removeEventListener, update, _activeEvents, _camera, _click, _eventMappings, _getWidthAndHeight, _height, _intersected, _mousePixelsX, _mousePixelsY, _mouseX, _mouseY, _mousedown, _mouseup, _objects, _previousIntersected, _previousMouseX, _previousMouseY, _previousObjects, _projector, _runEvents, _scene, _width;

    _projector = new THREE.Projector();
    _scene = null;
    _camera = null;
    _previousIntersected = [];
    _previousObjects = [];
    _intersected = [];
    _objects = [];
    _previousMouseX = _previousMouseY = 0;
    _width = _height = null;
    _mouseX = _mouseY = 0;
    _mousePixelsX = _mousePixelsY = 0;
    _activeEvents = {};
    _eventMappings = {};
    _getWidthAndHeight = function(container) {
      if (container.height() >= container.width() * 9 / 16) {
        _height = container.height();
        _width = _height * 16 / 9;
        return $('main').css({
          'overflow-x': 'scroll',
          'overflow-y': 'hidden'
        });
      } else {
        _width = container.width();
        return _height = _width * 9 / 16;
      }
    };
    _getWidthAndHeight($(window));
    _mousedown = false;
    _mouseup = false;
    _click = false;
    $(document.body).mousemove(function(e) {
      _mouseX = 2 * ((e.clientX + $('main').scrollLeft()) / _width) - 1;
      _mouseY = -2 * ((e.clientY + $(document).scrollTop()) / _height) + 1;
      _mousePixelsX = e.clientX;
      return _mousePixelsY = e.clientY;
    });
    $(document.body).click(function(e) {
      return _click = true;
    });
    $(document.body).mousedown(function(e) {
      _mousedown = true;
      return _mouseup = false;
    });
    $(document.body).mouseup(function(e) {
      _mousedown = false;
      return _mouseup = true;
    });
    $(window).resize(function(e) {
      return _getWidthAndHeight($(window));
    });
    _runEvents = function() {
      return _.each(_activeEvents, function(objects, event) {
        return _.each(objects, function(object) {
          var _ref;

          if (((_ref = _eventMappings[event]) != null ? _ref[object.id] : void 0) != null) {
            return _.each(_eventMappings[event][object.id], function(handler) {
              return handler(_objects);
            });
          }
        });
      });
    };
    init = function(scene, camera) {
      _scene = scene;
      return _camera = camera;
    };
    get = {
      mouse: function() {
        return [_mouseX, _mouseY];
      },
      mousePixels: function() {
        return [_mousePixelsX, _mousePixelsY];
      },
      screenSize: function() {
        return [_width, _height];
      }
    };
    update = function() {
      var intersection, previousIntersection, raycaster, vecOrigin, vecTarget, _ref;

      _activeEvents = {};
      _previousIntersected = _intersected;
      vecOrigin = new THREE.Vector3(_mouseX, _mouseY, -1);
      vecTarget = new THREE.Vector3(_mouseX, _mouseY, 1);
      _projector.unprojectVector(vecOrigin, _camera);
      _projector.unprojectVector(vecTarget, _camera);
      vecTarget.sub(vecOrigin).normalize();
      raycaster = new THREE.Raycaster(vecOrigin, vecTarget);
      _intersected = raycaster.intersectObjects(_scene.children);
      _objects = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = _intersected.length; _i < _len; _i++) {
          intersection = _intersected[_i];
          _results.push(intersection.object);
        }
        return _results;
      })();
      _previousObjects = (function() {
        var _i, _len, _results;

        _results = [];
        for (_i = 0, _len = _previousIntersected.length; _i < _len; _i++) {
          previousIntersection = _previousIntersected[_i];
          _results.push(previousIntersection.object);
        }
        return _results;
      })();
      _activeEvents.mouseover = _.difference(_objects, _previousObjects);
      _activeEvents.mouseout = _.difference(_previousObjects, _objects);
      if (_previousMouseX !== _mouseX && _previousMouseY !== _mouseY) {
        _activeEvents.mousemove = _.intersection(_objects, _previousObjects);
      }
      if (_objects.length > 0) {
        if (_mousedown) {
          _activeEvents.mousedown = _objects;
          _mousedown = false;
        }
        if (_mouseup) {
          _activeEvents.mouseup = _objects;
          _mouseup = false;
        }
        if (_click) {
          _activeEvents.click = _objects;
          _click = false;
        }
      }
      _ref = [_mouseX, _mouseY], _previousMouseX = _ref[0], _previousMouseY = _ref[1];
      return _runEvents();
    };
    addEventListener = function(event, objects, handler) {
      var arrObjects;

      arrObjects = !_.isArray(objects) ? [objects] : objects;
      _.each(arrObjects, function(object) {
        var _base, _name, _ref, _ref1;

        if ((_ref = _eventMappings[event]) == null) {
          _eventMappings[event] = {};
        }
        if ((_ref1 = (_base = _eventMappings[event])[_name = object.id]) == null) {
          _base[_name] = [];
        }
        return _eventMappings[event][object.id].push(handler);
      });
      return objects;
    };
    removeEventListener = function(event, objects, handler) {
      var arrObjects, hasEvents, index, object, objectEvents, _i, _len, _ref;

      arrObjects = !_.isArray(objects) ? [objects] : objects;
      for (_i = 0, _len = arrObjects.length; _i < _len; _i++) {
        object = arrObjects[_i];
        hasEvents = ((_ref = _eventMappings[event]) != null ? _ref[object.id] : void 0) != null;
        objectEvents = _eventMappings[event][object.id];
        if (objectEvents) {
          if ((hasEvents != null) && (index = objectEvents.indexOf(handler)) > -1) {
            objectEvents.splice(index, 1);
          } else if ((hasEvents != null) && (handler == null)) {
            _eventMappings[event][object.id] = [];
          }
        }
      }
      return objects;
    };
    return {
      init: init,
      get: get,
      update: update,
      addEventListener: addEventListener,
      on: addEventListener,
      removeEventListener: removeEventListener,
      off: removeEventListener
    };
  })();

}).call(this);
