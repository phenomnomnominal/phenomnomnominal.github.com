// Generated by CoffeeScript 1.6.2
(function() {
  var __hasProp = {}.hasOwnProperty;

  (typeof exports !== "undefined" && exports !== null ? exports : this).Blocks = (function() {
    var BLOCK_Y_SPACING, Block, BlockGroup, GAP, GEOMETRY, HALF_GAP, HALF_SIZE, HD_SCREEN_HEIGHT, HD_SCREEN_WIDTH, IN_POSITION, NUMBER_OF_BLOCK_PER_ROW, OFFSET, OUT_POSITION, SIZE, init, makeProjectTitle;

    HD_SCREEN_WIDTH = 1920;
    HD_SCREEN_HEIGHT = 1080;
    NUMBER_OF_BLOCK_PER_ROW = 50;
    BLOCK_Y_SPACING = HD_SCREEN_WIDTH / NUMBER_OF_BLOCK_PER_ROW;
    SIZE = BLOCK_Y_SPACING * 0.7;
    HALF_SIZE = SIZE / 2;
    IN_POSITION = SIZE * -0.5;
    OUT_POSITION = SIZE * -0.5 + 50;
    GAP = BLOCK_Y_SPACING * 0.3;
    HALF_GAP = GAP / 2;
    OFFSET = BLOCK_Y_SPACING;
    GEOMETRY = new THREE.CubeGeometry(SIZE, SIZE, SIZE);
    BlockGroup = (function() {
      function BlockGroup(blocks, elements, offDirection) {
        this.blocks = blocks;
        this.elements = elements;
        this.offDirection = offDirection;
        if (this.elements != null) {
          if (!this.elements.length) {
            this.elements = [this.elements];
          }
          if (this.elements instanceof NodeList || this.elements instanceof jQuery) {
            this.elements = Array.prototype.slice.call(this.elements);
          }
        }
        this.move(this.offDirection, 3000);
      }

      BlockGroup.prototype.get = function(prop) {
        return _.map(this.blocks, function(block) {
          return block[prop];
        });
      };

      BlockGroup.prototype.on = function(eventType, handler) {
        var objects;

        objects = this.get('object');
        Events.on(eventType, objects, handler);
        return this;
      };

      BlockGroup.prototype.off = function(eventType, handler) {
        var objects;

        objects = this.get('object');
        Events.off(eventType, objects, handler);
        return this;
      };

      BlockGroup.prototype.animate = function(options, callback) {
        var objects;

        objects = this.get('object');
        Animate(objects, options, callback);
        if (this.elements) {
          Animate(this.elements, options);
        }
        return this;
      };

      BlockGroup.prototype.move = function(direction, amount, css) {
        var block, _i, _len, _ref, _transformMappings;

        if (css == null) {
          css = {};
        }
        if (direction === 'LEFT' || direction === 'RIGHT') {
          amount *= direction === 'LEFT' ? -1 : 1;
          direction = 'x';
        }
        if (direction === 'UP' || direction === 'DOWN') {
          amount *= direction === 'DOWN' ? -1 : 1;
          direction = 'y';
        }
        _ref = this.blocks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          block = _ref[_i];
          block.object.position[direction] += amount;
        }
        if (this.elements) {
          if (direction === 'y') {
            amount *= -1;
          }
          _transformMappings = {
            'position.x': 'translateX',
            'position.y': 'translateY',
            'position.z': 'translateZ'
          };
          css[window.transform] = "" + _transformMappings['position.' + direction] + "(" + amount + "px)";
          $(this.elements).css(css);
        }
        return this;
      };

      return BlockGroup;

    })();
    Block = (function() {
      function Block(x, y, width, height, colour, content) {
        var letter, letterGeometry;

        this.x = x;
        this.y = y;
        this.width = width != null ? width : 1;
        this.height = height != null ? height : 1;
        this.colour = colour != null ? colour : Colours.blue;
        this.content = content != null ? content : null;
        this.material = Materials.phong(this.colour);
        this.object = new THREE.Mesh(GEOMETRY, this.material);
        this.object.position.x = this.x * OFFSET + (this.width * HALF_SIZE) + (this.width - 1) * HALF_GAP;
        this.object.position.y = HD_SCREEN_HEIGHT - this.y * OFFSET - (this.height * HALF_SIZE) - (this.height - 1) * HALF_GAP;
        this.object.position.z = IN_POSITION;
        this.object.scale.x = (SIZE * this.width + GAP * (this.width - 1)) / SIZE;
        this.object.scale.y = (SIZE * this.height + GAP * (this.height - 1)) / SIZE;
        this.object.castShadow = this.object.recieveShadow = true;
        if (this.content != null) {
          letterGeometry = new THREE.TextGeometry(this.content, {
            font: 'college',
            size: SIZE * 0.9
          });
          letter = new THREE.Mesh(letterGeometry, Materials.lambert(Colours.white));
          letter.position = new THREE.Vector3(-SIZE * (this.content === 'I' ? 0.18 : 0.3), -SIZE * 0.45, -SIZE * 0.35);
          letter.scale.z = 0.6;
          this.object.add(letter);
        }
        Main.scene.add(this.object);
      }

      return Block;

    })();
    init = function(callback) {
      var global;

      global = typeof exports !== "undefined" && exports !== null ? exports : window;
      return $.getJSON('blocks.json', function(result) {
        var blockGroup, blockGroups, blocks, colour, content, elementEvents, event, events, handlerName, height, name, offDirection, page, requires, selector, width, x, y, _base, _base1, _ref, _ref1;

        for (page in result) {
          if (!__hasProp.call(result, page)) continue;
          blockGroups = result[page];
          if ((_ref = (_base = global.Blocks)[page]) == null) {
            _base[page] = {};
          }
          for (name in blockGroups) {
            if (!__hasProp.call(blockGroups, name)) continue;
            blockGroup = blockGroups[name];
            if ((_ref1 = (_base1 = global.Blocks[page])[name]) == null) {
              _base1[name] = {};
            }
            x = blockGroup.x, y = blockGroup.y, blocks = blockGroup.blocks, width = blockGroup.width, height = blockGroup.height, colour = blockGroup.colour, content = blockGroup.content;
            requires = blockGroup.requires, offDirection = blockGroup.offDirection, selector = blockGroup.selector, events = blockGroup.events, elementEvents = blockGroup.elementEvents;
            blocks = _.map(blocks, function(block) {
              var blockColour, blockContent, blockHeight, blockRequires, blockWidth, blockX, blockY, requiresOk, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;

              blockX = (_ref2 = block.x) != null ? _ref2 : x;
              blockY = (_ref3 = block.y) != null ? _ref3 : y;
              blockWidth = (_ref4 = block.width) != null ? _ref4 : width;
              blockHeight = (_ref5 = block.height) != null ? _ref5 : height;
              blockColour = (_ref6 = block.colour) != null ? _ref6 : colour;
              blockContent = (_ref7 = block.content) != null ? _ref7 : content;
              blockRequires = (_ref8 = block.requires) != null ? _ref8 : requires;
              requiresOk = true;
              if (blockRequires != null) {
                _.each(blockRequires.split(' '), function(require) {
                  return requiresOk = requiresOk && Modernizr[require];
                });
              }
              if (requiresOk) {
                return new Block(blockX, blockY, blockWidth, blockHeight, Colours[blockColour], blockContent);
              }
            });
            if (blocks.length > 0) {
              blockGroup = new BlockGroup(blocks, $(selector), offDirection);
              for (event in events) {
                if (!__hasProp.call(events, event)) continue;
                handlerName = events[event];
                if (handlerName === 'menuOver') {
                  blockGroup.on(event, UI.events[handlerName](blockGroup, name));
                } else {
                  blockGroup.on(event, UI.events[handlerName]);
                }
              }
              for (event in elementEvents) {
                if (!__hasProp.call(elementEvents, event)) continue;
                handlerName = elementEvents[event];
                $(blockGroup.elements).on(event, UI.events[handlerName]);
              }
              global.Blocks[page][name] = blockGroup;
            }
          }
        }
        return callback();
      });
    };
    makeProjectTitle = function(name) {
      var titleBlocks;

      titleBlocks = (function() {
        var BLOCK_X;

        BLOCK_X = _.map(name, function(content, i) {
          return 2 + i * 2;
        });
        return _.map(BLOCK_X, function(x, i) {
          return new Block(x, 2, 2, 2, Colours.blue, name[i]);
        });
      })();
      return new BlockGroup(titleBlocks, null, 'RIGHT');
    };
    return {
      init: init,
      makeProjectTitle: makeProjectTitle,
      OUT_POSITION: OUT_POSITION,
      IN_POSITION: IN_POSITION
    };
  })();

}).call(this);
