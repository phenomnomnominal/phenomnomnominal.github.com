// Generated by CoffeeScript 1.6.2
(function() {
  $(function() {
    var addDomEvents, _ref;

    if (Modernizr.webgl) {
      addDomEvents = function() {
        document.body.addEventListener('mousemove', UI.events.mousemove);
        document.body.addEventListener(fullscreenchange, UI.events.windowResize);
        $(window).on('resize', UI.events.windowResize);
        return $(window).trigger('resize');
      };
      _ref = Rendering.init(), Main.scene = _ref[0], Main.camera = _ref[1];
      Events.init(Main.scene, Main.camera);
      return Blocks.init(function() {
        Blog.init();
        CV.init();
        DeviceOrientation.init();
        return Scenes.init(function() {
          Routing.init();
          Thingie.init();
          Twitter.init();
          addDomEvents();
          return Main.update();
        });
      });
    }
  });

  (typeof exports !== "undefined" && exports !== null ? exports : this).Main = (function() {
    var toggleDebug, update;

    toggleDebug = function() {
      Main.debug = !Main.debug;
      return Rendering.toggleDebug();
    };
    update = function() {
      Animate.update();
      Events.update();
      Rendering.update();
      Thingie.update();
      Projects.update();
      return requestAnimationFrame(update);
    };
    return {
      debug: false,
      toggleDebug: toggleDebug,
      update: update
    };
  })();

}).call(this);
