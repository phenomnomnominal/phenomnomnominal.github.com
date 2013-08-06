// Generated by CoffeeScript 1.6.3
(function() {
  var I, J, L, O, S, T, Tetrimino, TetriminoBag, TetrisAI, TetrisGrid, Z, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (typeof exports !== "undefined" && exports !== null ? exports : this).tetris = (function() {
    var $CONTAINER, CANVAS, CELL_PADDING, CELL_SIZE, COLOURS, CONTEXT, GAMES, GAMES_PER_ROW, GAME_HEIGHT, GAME_WIDTH, INFO_HEIGHT, POPULATION_SIZE, ROWS, best, init, kill, toUpdate, update, _move, _resize;
    COLOURS = [null, '#000000', '#222222', '#444444', '#666666', '#888888', '#AAAAAA', '#CCCCCC'];
    $CONTAINER = CANVAS = GAMES = CONTEXT = GAME_WIDTH = GAME_HEIGHT = CELL_PADDING = CELL_SIZE = INFO_HEIGHT = null;
    POPULATION_SIZE = 32;
    GAMES_PER_ROW = 12;
    ROWS = 3;
    best = null;
    toUpdate = [];
    _resize = function() {
      CANVAS.width = $CONTAINER.innerWidth() - 50;
      CANVAS.height = $CONTAINER.innerHeight() - 50;
      GAME_WIDTH = CANVAS.width / GAMES_PER_ROW;
      CELL_PADDING = 10;
      CELL_SIZE = (GAME_WIDTH - CELL_PADDING * 2) / 10;
      GAME_HEIGHT = CELL_SIZE * 20;
      return GAME_HEIGHT += (CANVAS.height - (ROWS * GAME_HEIGHT)) / ROWS;
    };
    _move = function(tetris, index) {
      if (best === null) {
        best = tetris;
        best.index = index + 1;
        best.generation = Genie.getGeneration();
      } else if (tetris.score > best.score) {
        best = tetris;
        best.index = index + 1;
        best.generation = Genie.getGeneration();
      }
      return toUpdate.push({
        tetris: tetris,
        index: index
      });
    };
    init = function($container) {
      var genieInit;
      $CONTAINER = $container;
      $CONTAINER.empty();
      CANVAS = $('<canvas>').get(0);
      $CONTAINER.append(CANVAS);
      CONTEXT = CANVAS.getContext('2d');
      $(window).resize(_resize);
      if (WorkerBench.workersAvailable()) {
        genieInit = function() {
          _resize();
          Genie.init({
            workerMessageHandler: function(e) {
              switch (e.data.func) {
                case 'move':
                  _move(e.data.tetris, e.data.index);
                  return e.target.postMessage({
                    func: 'update'
                  });
                case 'complete':
                  return Genie.reportFitness(e.data.score, e.data.index);
              }
            },
            workerScriptPath: '/javascript/tetrisWorker.js',
            useWorkers: WorkerBench.result(),
            logging: true,
            numberOfGenes: 8
          });
          return Genie.run();
        };
        WorkerBench.init({
          onComplete: genieInit
        });
        return WorkerBench.start();
      } else {
        _resize();
        Genie.init({
          evaluateFitness: function(chromosome, chromosomeIndex) {
            var tetris, update;
            tetris = new TetrisAI(chromosome.genes);
            update = function() {
              debugger;
              if (tetris.gameOver()) {
                return Genie.reportFitness(tetris.score, chromosomeIndex);
              } else {
                _move(tetris, chromosomeIndex);
                tetris.makeMove();
                return requestAnimFrame(update);
              }
            };
            return update();
          },
          logging: true,
          numberOfGenes: 8,
          useWorkers: false
        });
        return Genie.run();
      }
    };
    update = function() {
      var fillX, fillY, game, value, x, xIndex, y, yIndex, _i, _j, _k, _len;
      for (_i = 0, _len = toUpdate.length; _i < _len; _i++) {
        game = toUpdate[_i];
        xIndex = game.index % GAMES_PER_ROW;
        yIndex = Math.floor(game.index / GAMES_PER_ROW);
        CONTEXT.clearRect(xIndex * GAME_WIDTH + CELL_PADDING, yIndex * GAME_HEIGHT + CELL_PADDING, GAME_WIDTH, GAME_HEIGHT);
        CONTEXT.fillStyle = 'rgba(0, 0, 0, 0.1)';
        CONTEXT.fillRect(xIndex * GAME_WIDTH + CELL_PADDING, yIndex * GAME_HEIGHT + CELL_PADDING, CELL_SIZE * 10, CELL_SIZE * 20);
        if (game.tetris != null) {
          for (x = _j = 0; _j < 10; x = ++_j) {
            for (y = _k = 0; _k < 20; y = ++_k) {
              value = game.tetris.grid[y + 1][x + 1];
              if (value !== 0 && value !== 8 && value !== 9 && value !== (-2) && value !== (-3)) {
                CONTEXT.fillStyle = COLOURS[value];
                fillX = x * CELL_SIZE + 1 + xIndex * GAME_WIDTH + CELL_PADDING;
                fillY = y * CELL_SIZE + 1 + yIndex * GAME_HEIGHT + CELL_PADDING;
                CONTEXT.fillRect(fillX, fillY, CELL_SIZE - 2, CELL_SIZE - 2);
              }
            }
          }
          game.update = false;
          CONTEXT.font = 'bold 30px College';
          CONTEXT.fillStyle = '#444499';
          CONTEXT.fillText(game.index + 1, xIndex * GAME_WIDTH + CELL_PADDING + 5, yIndex * GAME_HEIGHT + CELL_PADDING + 25);
          CONTEXT.font = 'bold 15px College';
          CONTEXT.fillStyle = '#44BB44';
          CONTEXT.fillText(game.tetris.score, xIndex * GAME_WIDTH + CELL_PADDING + 5, yIndex * GAME_HEIGHT + CELL_PADDING + 50);
        }
      }
      toUpdate = [];
      if (best) {
        CONTEXT.font = 'bold 30px College';
        CONTEXT.clearRect(GAME_WIDTH * 8, (GAME_HEIGHT + INFO_HEIGHT) * 2, 400, 150);
        CONTEXT.fillStyle = '#444499';
        CONTEXT.fillText('BEST SCORE: ', GAME_WIDTH * 8 + 10, GAME_HEIGHT * 2 + 30);
        CONTEXT.fillText('GENERATION: ', GAME_WIDTH * 8 + 10, GAME_HEIGHT * 2 + 70);
        CONTEXT.fillText('CANDIDATE: ', GAME_WIDTH * 8 + 10, GAME_HEIGHT * 2 + 110);
        CONTEXT.fillStyle = '#449944';
        CONTEXT.fillText((best != null ? best.score : void 0) || '', GAME_WIDTH * 8 + 200, GAME_HEIGHT * 2 + 30);
        CONTEXT.fillText((best != null ? best.generation : void 0) || '', GAME_WIDTH * 8 + 200, GAME_HEIGHT * 2 + 70);
        return CONTEXT.fillText((best != null ? best.index : void 0) || '', GAME_WIDTH * 8 + 200, GAME_HEIGHT * 2 + 110);
      }
    };
    kill = function() {
      return Genie.kill();
    };
    return {
      init: init,
      update: update,
      kill: kill
    };
  })();

  TetrisAI = (function() {
    var clearLines, getBestNextMove, getHighestRow, getPossibleMoves, movePathExists, replaceLines, score, setLevel, setScore;

    TetrisAI.BLOCKADE_WEIGHT = 0;

    TetrisAI.HEIGHT_WEIGHT = 0;

    TetrisAI.LOSE_WEIGHT = 0;

    TetrisAI.HOLES_WEIGHT = 0;

    TetrisAI.LINE_CLEAR_WEIGHT = 0;

    TetrisAI.TOUCH_BLOCK_WEIGHT = 0;

    TetrisAI.TOUCH_FLOOR_WEIGHT = 0;

    TetrisAI.TOUCH_WALL_WEIGHT = 0;

    TetrisAI.ScoreWeights = function(weights) {
      this.BLOCKADE_WEIGHT = weights[0];
      this.HEIGHT_WEIGHT = weights[1];
      this.LOSE_WEIGHT = weights[2];
      this.HOLES_WEIGHT = weights[3];
      this.LINE_CLEAR_WEIGHT = weights[4];
      this.TOUCH_BLOCK_WEIGHT = weights[5];
      this.TOUCH_FLOOR_WEIGHT = weights[6];
      return this.TOUCH_WALL_WEIGHT = weights[7];
    };

    function TetrisAI(weights, workers) {
      var x, y;
      TetrisAI.ScoreWeights(weights);
      this._ = {
        bag: new TetriminoBag(),
        tetriminoes: {
          current: null,
          next: null
        }
      };
      this._.tetriminoes.current = this._.bag.getNext();
      this._.tetriminoes.next = this._.bag.getNext();
      this.grid = (function() {
        var _i, _results;
        _results = [];
        for (x = _i = 0; _i <= 21; x = ++_i) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (y = _j = 0; _j <= 11; y = ++_j) {
              if (y === 0 || y === 11) {
                _results1.push(-3);
              } else if (x === 0 || x === 21) {
                _results1.push(-2);
              } else {
                _results1.push(0);
              }
            }
            return _results1;
          })());
        }
        return _results;
      })();
      this.level = 0;
      this.lines = 0;
      this.moves = 0;
      this.score = 0;
    }

    TetrisAI.prototype.makeMove = function() {
      var bestNextMove, bestScore, clearedLines, _ref, _ref1;
      _ref = getBestNextMove(this.grid, this._.tetriminoes), bestNextMove = _ref[0], bestScore = _ref[1];
      if (bestNextMove) {
        this.grid = TetrisGrid.Update(this.grid, this._.tetriminoes.current, bestNextMove, 'ADD');
        _ref1 = clearLines(this.grid), this.grid = _ref1[0], clearedLines = _ref1[1];
        this.lines += clearedLines.length;
        this.level = setLevel(this.lines);
        this.score += setScore(clearedLines.length, this.level);
        this._.tetriminoes.current = this._.tetriminoes.next;
        this._.tetriminoes.next = this._.bag.getNext();
        this.moves++;
        return bestScore;
      } else {
        return this.noMoves = true;
      }
    };

    TetrisAI.prototype.gameOver = function() {
      return _.any(this.grid[1].slice(1, 11), (function(val) {
        return val > 0;
      })) || this.noMoves;
    };

    getBestNextMove = function(grid, tetriminoes) {
      var bestMove, bestScore, bestScoreObj, clearedLines, current, firstMoveScore, firstTouchDownScore, followingMove, key, next, nextMove, possibleFollowingMoves, possibleNextMoves, secondMoveScore, secondTouchDownScore, totalFirstMoveScore, totalSecondMoveScore, value, _i, _j, _len, _len1, _ref;
      current = tetriminoes.current, next = tetriminoes.next;
      possibleNextMoves = getPossibleMoves(grid, current);
      possibleFollowingMoves = getPossibleMoves(grid, next);
      bestScore = -Infinity;
      bestMove = null;
      for (_i = 0, _len = possibleNextMoves.length; _i < _len; _i++) {
        nextMove = possibleNextMoves[_i];
        if (nextMove.valid) {
          if (movePathExists(grid, current, nextMove)) {
            grid = TetrisGrid.Update(grid, current, nextMove, 'ADD');
            firstTouchDownScore = score.touchDown(grid, current, nextMove);
            if (firstTouchDownScore > 0) {
              firstMoveScore = {
                blockades: score.blockades(grid, current, nextMove),
                height: score.height(current, nextMove),
                holes: score.holes(grid, current, nextMove),
                lines: score.lines(grid),
                touchDown: firstTouchDownScore,
                touchSide: score.touchSide(grid, current, nextMove)
              };
              totalFirstMoveScore = 0;
              for (key in firstMoveScore) {
                if (!__hasProp.call(firstMoveScore, key)) continue;
                value = firstMoveScore[key];
                totalFirstMoveScore += value;
              }
              if (firstMoveScore.lines > 0) {
                _ref = clearLines(grid), grid = _ref[0], clearedLines = _ref[1];
              }
              possibleFollowingMoves = _.map(possibleFollowingMoves, (function(move) {
                var column, minus, plus, rotation, row, _ref1;
                rotation = move.rotation, row = move.row, column = move.column;
                _ref1 = next.offset, minus = _ref1.minus, plus = _ref1.plus;
                move.valid = TetrisGrid.ValidPosition(next.shape[rotation], row, column, minus, plus, grid);
                return move;
              }));
              for (_j = 0, _len1 = possibleFollowingMoves.length; _j < _len1; _j++) {
                followingMove = possibleFollowingMoves[_j];
                if (followingMove.valid) {
                  if (movePathExists(grid, next, followingMove)) {
                    grid = TetrisGrid.Update(grid, next, followingMove, 'ADD');
                    secondTouchDownScore = score.touchDown(grid, next, followingMove);
                    if (secondTouchDownScore > 0) {
                      secondMoveScore = {
                        blockades: score.blockades(grid, next, followingMove),
                        height: score.height(next, followingMove),
                        holes: score.holes(grid, next, followingMove),
                        lines: score.lines(grid),
                        touchDown: secondTouchDownScore,
                        touchSide: score.touchSide(grid, next, followingMove)
                      };
                      totalSecondMoveScore = 0;
                      for (key in secondMoveScore) {
                        if (!__hasProp.call(secondMoveScore, key)) continue;
                        value = secondMoveScore[key];
                        totalSecondMoveScore += value;
                      }
                      if (totalFirstMoveScore + totalSecondMoveScore > bestScore) {
                        bestScore = totalFirstMoveScore + totalSecondMoveScore;
                        bestScoreObj = firstMoveScore;
                        bestMove = nextMove;
                      }
                    }
                    grid = TetrisGrid.Update(grid, next, followingMove, 'SUB');
                  }
                }
              }
              if (firstMoveScore.lines > 0) {
                grid = replaceLines(grid, clearedLines);
              }
            }
            grid = TetrisGrid.Update(grid, current, nextMove, 'SUB');
          }
        }
      }
      return [bestMove, bestScoreObj];
    };

    getPossibleMoves = function(grid, tetrimino) {
      var highestRow, possibleMoves;
      highestRow = getHighestRow(grid);
      possibleMoves = _.filter(tetrimino.domain, (function(move) {
        return move.row >= highestRow;
      }));
      return possibleMoves = _.map(possibleMoves, (function(move) {
        var column, minus, plus, rotation, row, _ref;
        rotation = move.rotation, row = move.row, column = move.column;
        _ref = tetrimino.offset, minus = _ref.minus, plus = _ref.plus;
        move.valid = TetrisGrid.ValidPosition(tetrimino.shape[rotation], row, column, minus, plus, grid);
        return move;
      }));
    };

    getHighestRow = function(grid) {
      var column, row, _i, _j;
      for (row = _i = 1; _i <= 20; row = ++_i) {
        for (column = _j = 1; _j <= 10; column = ++_j) {
          if (grid[row][column] > 0) {
            return Math.max(1, row - 3);
          }
        }
      }
      return 17;
    };

    movePathExists = function(grid, tetrimino, move) {
      var block, column, realColumn, realRow, row, rowLength, shape, up, upRow, _i, _j, _k, _len, _ref;
      shape = tetrimino.shape[move.rotation];
      rowLength = shape[0].length;
      for (column = _i = 0; 0 <= rowLength ? _i < rowLength : _i > rowLength; column = 0 <= rowLength ? ++_i : --_i) {
        for (row = _j = 0, _ref = shape.length; 0 <= _ref ? _j < _ref : _j > _ref; row = 0 <= _ref ? ++_j : --_j) {
          if (shape[row][column] === 1) {
            realRow = move.row - tetrimino.offset.minus + row;
            realColumn = move.column - tetrimino.offset.minus + column;
            up = (function() {
              var _k, _results;
              _results = [];
              for (upRow = _k = 1; 1 <= realRow ? _k < realRow : _k > realRow; upRow = 1 <= realRow ? ++_k : --_k) {
                _results.push(grid[upRow][realColumn]);
              }
              return _results;
            })();
            for (_k = 0, _len = up.length; _k < _len; _k++) {
              block = up[_k];
              if (block > 0) {
                return false;
              }
            }
            break;
          }
        }
      }
      return true;
    };

    score = {
      blockades: function(grid, tetrimino, move) {
        var block, blockades, column, foundFirstHole, realColumn, realRow, row, rowLength, shape, up, _i, _j, _len;
        blockades = 0;
        shape = tetrimino.shape[move.rotation];
        rowLength = shape[0].length;
        for (column = _i = 0; 0 <= rowLength ? _i < rowLength : _i > rowLength; column = 0 <= rowLength ? ++_i : --_i) {
          if (_.any((function() {
            var _j, _ref, _results;
            _results = [];
            for (row = _j = 0, _ref = shape.length; 0 <= _ref ? _j < _ref : _j > _ref; row = 0 <= _ref ? ++_j : --_j) {
              _results.push(shape[row][column]);
            }
            return _results;
          })(), (function(val) {
            return val === 1;
          }))) {
            realRow = move.row - tetrimino.offset.minus;
            realColumn = move.column - tetrimino.offset.minus + column;
            up = (function() {
              var _j, _results;
              _results = [];
              for (row = _j = 21; 21 <= realRow ? _j <= realRow : _j >= realRow; row = 21 <= realRow ? ++_j : --_j) {
                _results.push(grid[row][realColumn]);
              }
              return _results;
            })();
            foundFirstHole = false;
            for (_j = 0, _len = up.length; _j < _len; _j++) {
              block = up[_j];
              if (block === 0) {
                foundFirstHole = true;
              } else if (foundFirstHole && block > 0) {
                blockades++;
              }
            }
          }
        }
        return TetrisAI.BLOCKADE_WEIGHT * blockades;
      },
      height: function(tetrimino, move) {
        var column, height, lose, realRow, rotation, row, _i, _j, _ref, _ref1;
        height = 0;
        lose = 0;
        rotation = tetrimino.shape[move.rotation];
        for (row = _i = 0, _ref = rotation.length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
          for (column = _j = 0, _ref1 = rotation[row].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
            realRow = move.row - tetrimino.offset.minus + row;
            if (realRow === 1) {
              lose = 1;
            }
            height += rotation[row][column] * (21 - realRow);
          }
        }
        return TetrisAI.HEIGHT_WEIGHT * height + TetrisAI.LOSE_WEIGHT * lose;
      },
      holes: function(grid, tetrimino, move) {
        var block, column, down, foundFirstBlock, holes, realColumn, realRow, row, rowLength, shape, _i, _j, _len;
        holes = 0;
        shape = tetrimino.shape[move.rotation];
        rowLength = shape[0].length;
        for (column = _i = 0; 0 <= rowLength ? _i < rowLength : _i > rowLength; column = 0 <= rowLength ? ++_i : --_i) {
          if (_.any((function() {
            var _j, _ref, _results;
            _results = [];
            for (row = _j = 0, _ref = shape.length; 0 <= _ref ? _j < _ref : _j > _ref; row = 0 <= _ref ? ++_j : --_j) {
              _results.push(shape[row][column]);
            }
            return _results;
          })(), (function(val) {
            return val === 1;
          }))) {
            realRow = move.row - tetrimino.offset.minus;
            realColumn = move.column - tetrimino.offset.minus + column;
            down = (function() {
              var _j, _results;
              _results = [];
              for (row = _j = realRow; realRow <= 21 ? _j <= 21 : _j >= 21; row = realRow <= 21 ? ++_j : --_j) {
                _results.push(grid[row][realColumn]);
              }
              return _results;
            })();
            foundFirstBlock = false;
            for (_j = 0, _len = down.length; _j < _len; _j++) {
              block = down[_j];
              if (block > 0) {
                foundFirstBlock = true;
              } else if (foundFirstBlock && block === 0) {
                holes++;
              }
            }
          }
        }
        return TetrisAI.HOLES_WEIGHT * holes;
      },
      lines: function(grid) {
        var lines, row, _i;
        lines = 0;
        for (row = _i = 20; _i >= 1; row = --_i) {
          if (_.all(grid[row].slice(1, 11), (function(val) {
            return val > 0;
          }))) {
            lines++;
          }
        }
        return TetrisAI.LINE_CLEAR_WEIGHT * lines;
      },
      touchDown: function(grid, tetrimino, move) {
        var column, gridBlock, offCol, offRow, realColumn, realRow, row, shape, shapeBlock, touch, _i, _j, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
        touch = {
          block: 0,
          floor: 0
        };
        shape = tetrimino.shape[move.rotation];
        for (row = _i = 0, _ref = shape.length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
          for (column = _j = 0, _ref1 = shape[row].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
            if (shape[row][column] === 1) {
              realRow = move.row - tetrimino.offset.minus + row;
              realColumn = move.column - tetrimino.offset.minus + column;
              if (realRow === 20) {
                touch.floor++;
              }
              _ref2 = [1, 0], offRow = _ref2[0], offCol = _ref2[1];
              gridBlock = (_ref3 = (_ref4 = grid[realRow + offRow]) != null ? _ref4[realColumn + offCol] : void 0) != null ? _ref3 : 0;
              shapeBlock = (_ref5 = (_ref6 = shape[row + offRow]) != null ? _ref6[column + offCol] : void 0) != null ? _ref5 : 0;
              if (gridBlock > 0 && shapeBlock !== 1) {
                touch.block++;
              }
            }
          }
        }
        return TetrisAI.TOUCH_BLOCK_WEIGHT * touch.block + TetrisAI.TOUCH_FLOOR_WEIGHT * touch.floor;
      },
      touchSide: function(grid, tetrimino, move) {
        var column, gridBlock, offCol, offRow, realColumn, realRow, row, shape, shapeBlock, touch, _i, _j, _k, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        touch = {
          block: 0,
          wall: 0
        };
        shape = tetrimino.shape[move.rotation];
        for (row = _i = 0, _ref = shape.length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
          for (column = _j = 0, _ref1 = shape[row].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
            if (shape[row][column] === 1) {
              realRow = move.row - tetrimino.offset.minus + row;
              realColumn = move.column - tetrimino.offset.minus + column;
              if (realColumn === 1 || realColumn === 10) {
                touch.wall++;
              }
              _ref2 = [[0, 1], [1, 0]];
              for (_k = 0, _len = _ref2.length; _k < _len; _k++) {
                _ref3 = _ref2[_k], offRow = _ref3[0], offCol = _ref3[1];
                gridBlock = (_ref4 = (_ref5 = grid[realRow + offRow]) != null ? _ref5[realColumn + offCol] : void 0) != null ? _ref4 : 0;
                shapeBlock = (_ref6 = (_ref7 = shape[row + offRow]) != null ? _ref7[column + offCol] : void 0) != null ? _ref6 : 0;
                if (gridBlock > 0 && shapeBlock !== 1) {
                  touch.block++;
                }
              }
            }
          }
        }
        return TetrisAI.TOUCH_BLOCK_WEIGHT * touch.block + TetrisAI.TOUCH_WALL_WEIGHT * touch.wall;
      }
    };

    clearLines = function(grid) {
      var clearedLine, clearedLines, row, rowUp, _i, _j, _ref;
      clearedLines = [];
      for (row = _i = 20; _i >= 1; row = --_i) {
        if (_.all(grid[row + clearedLines.length].slice(1, 11), (function(val) {
          return val > 0;
        }))) {
          clearedLine = {
            row: row,
            line: grid[row + clearedLines.length]
          };
          for (rowUp = _j = _ref = row + clearedLines.length; _ref <= 1 ? _j < 1 : _j > 1; rowUp = _ref <= 1 ? ++_j : --_j) {
            grid[rowUp] = grid[rowUp - 1];
          }
          grid[1] = [-3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -3];
          clearedLines.push(clearedLine);
        }
      }
      return [grid, clearedLines];
    };

    replaceLines = function(grid, clearedLines) {
      var clearedLine, rowDown, _i, _j, _len, _ref;
      for (_i = 0, _len = clearedLines.length; _i < _len; _i++) {
        clearedLine = clearedLines[_i];
        for (rowDown = _j = 1, _ref = clearedLine.row - 1; 1 <= _ref ? _j <= _ref : _j >= _ref; rowDown = 1 <= _ref ? ++_j : --_j) {
          grid[rowDown] = grid[rowDown + 1];
        }
        grid[clearedLine.row] = clearedLine.line;
      }
      return grid;
    };

    setLevel = function(lines) {
      return Math.floor(Math.min(lines, 100) / 10);
    };

    setScore = function(linesCleared, level) {
      var scores;
      scores = [0, 40, 100, 300, 1200];
      return scores[linesCleared] * (level + 1) + 20;
    };

    return TetrisAI;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.TetrisAI = TetrisAI;

  TetrisGrid = (function() {
    var x, y;

    function TetrisGrid() {}

    TetrisGrid.BLANK = (function() {
      var _i, _results;
      _results = [];
      for (x = _i = 0; _i <= 21; x = ++_i) {
        _results.push((function() {
          var _j, _results1;
          _results1 = [];
          for (y = _j = 0; _j <= 11; y = ++_j) {
            if (y === 0 || y === 11) {
              _results1.push(-3);
            } else if (x === 0 || x === 21) {
              _results1.push(-2);
            } else {
              _results1.push(0);
            }
          }
          return _results1;
        })());
      }
      return _results;
    })();

    TetrisGrid.Update = function(grid, tetrimino, move, func) {
      var column, gridColumnN, gridRow, gridRowN, row, _i, _j, _ref, _ref1, _ref2;
      for (row = _i = 0, _ref = tetrimino.shape[move.rotation].length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
        gridRowN = move.row - tetrimino.offset.minus + row;
        gridRow = grid[gridRowN];
        for (column = _j = 0, _ref1 = tetrimino.shape[move.rotation][row].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
          gridColumnN = move.column - tetrimino.offset.minus + column;
          if (((_ref2 = grid[gridRowN]) != null ? _ref2[gridColumnN] : void 0) != null) {
            if (func === 'ADD') {
              grid[gridRowN][gridColumnN] += tetrimino.shape[move.rotation][row][column] * tetrimino.colour;
            } else if (func === 'SUB') {
              grid[gridRowN][gridColumnN] -= tetrimino.shape[move.rotation][row][column] * tetrimino.colour;
            }
          }
        }
      }
      return grid;
    };

    TetrisGrid.CreateDomain = function(tetrimino, domain) {
      var column, offsetM, offsetP, rotation, row, _i, _j, _k, _ref;
      if (domain == null) {
        domain = [];
      }
      offsetM = tetrimino.offset.minus;
      offsetP = tetrimino.offset.plus;
      for (rotation = _i = 0, _ref = tetrimino.shape.length; 0 <= _ref ? _i < _ref : _i > _ref; rotation = 0 <= _ref ? ++_i : --_i) {
        for (row = _j = 20; _j >= 1; row = --_j) {
          for (column = _k = 1; _k <= 10; column = ++_k) {
            if (TetrisGrid.ValidPosition(tetrimino.shape[rotation], row, column, offsetM, offsetP)) {
              domain.push({
                rotation: rotation,
                row: row,
                column: column,
                valid: true
              });
            }
          }
        }
      }
      return domain;
    };

    TetrisGrid.ValidPosition = function(shape, row, column, offM, offP, grid) {
      var surroundingRow, surroundingRows, surroundings, _i, _j, _ref, _ref1;
      if (grid == null) {
        grid = TetrisGrid.BLANK;
      }
      surroundingRows = grid.slice(row - offM, +(row + offP) + 1 || 9e9);
      surroundings = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = surroundingRows.length; _i < _len; _i++) {
          surroundingRow = surroundingRows[_i];
          _results.push(surroundingRow.slice(column - offM, +(column + offP) + 1 || 9e9));
        }
        return _results;
      })();
      for (row = _i = 0, _ref = surroundings.length; 0 <= _ref ? _i < _ref : _i > _ref; row = 0 <= _ref ? ++_i : --_i) {
        for (column = _j = 0, _ref1 = surroundings[row].length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; column = 0 <= _ref1 ? ++_j : --_j) {
          if (shape[row][column] === 1 && surroundings[row][column] !== 0) {
            return false;
          }
        }
      }
      return true;
    };

    return TetrisGrid;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.TetrisGrid = TetrisGrid;

  Tetrimino = (function() {
    function Tetrimino(colour, offset, rotation) {
      this.colour = colour;
      this.offset = offset;
      this.rotation = rotation != null ? rotation : 0;
      this.domain = TetrisGrid.CreateDomain(this);
    }

    return Tetrimino;

  })();

  I = (function(_super) {
    __extends(I, _super);

    function I() {
      this.shape = [[[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]];
      I.__super__.constructor.call(this, 1, {
        plus: 2,
        minus: 1
      });
    }

    return I;

  })(Tetrimino);

  J = (function(_super) {
    __extends(J, _super);

    function J() {
      this.shape = [[[0, 0, 0], [1, 1, 1], [0, 0, 1]], [[0, 1, 0], [0, 1, 0], [1, 1, 0]], [[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 1], [0, 1, 0], [0, 1, 0]]];
      J.__super__.constructor.call(this, 2, {
        plus: 1,
        minus: 1
      });
    }

    return J;

  })(Tetrimino);

  L = (function(_super) {
    __extends(L, _super);

    function L() {
      this.shape = [[[0, 0, 0], [1, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 0], [0, 1, 0]], [[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 0], [0, 1, 1]]];
      L.__super__.constructor.call(this, 3, {
        plus: 1,
        minus: 1
      });
    }

    return L;

  })(Tetrimino);

  O = (function(_super) {
    __extends(O, _super);

    function O() {
      this.shape = [[[1, 1], [1, 1]]];
      O.__super__.constructor.call(this, 4, {
        plus: 1,
        minus: 0
      });
    }

    return O;

  })(Tetrimino);

  S = (function(_super) {
    __extends(S, _super);

    function S() {
      this.shape = [[[0, 0, 0], [0, 1, 1], [1, 1, 0]], [[1, 0, 0], [1, 1, 0], [0, 1, 0]], [[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 0, 1]]];
      S.__super__.constructor.call(this, 5, {
        plus: 1,
        minus: 1
      });
    }

    return S;

  })(Tetrimino);

  T = (function(_super) {
    __extends(T, _super);

    function T() {
      this.shape = [[[0, 0, 0], [1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 0], [0, 1, 0]], [[0, 1, 0], [1, 1, 1], [0, 0, 0]], [[0, 1, 0], [0, 1, 1], [0, 1, 0]]];
      T.__super__.constructor.call(this, 6, {
        plus: 1,
        minus: 1
      });
    }

    return T;

  })(Tetrimino);

  Z = (function(_super) {
    __extends(Z, _super);

    function Z() {
      this.shape = [[[0, 0, 0], [1, 1, 0], [0, 1, 1]], [[0, 1, 0], [1, 1, 0], [1, 0, 0]], [[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 0, 1], [0, 1, 1], [0, 1, 0]]];
      Z.__super__.constructor.call(this, 7, {
        plus: 1,
        minus: 1
      });
    }

    return Z;

  })(Tetrimino);

  TetriminoBag = (function() {
    function TetriminoBag() {
      this._ = {
        bag: [new I(), new J(), new L(), new O(), new S(), new T(), new Z()],
        nextBag: []
      };
    }

    TetriminoBag.prototype.getNext = function() {
      var select, selected;
      if (this._.bag.length === 0) {
        this._.bag = this._.nextBag;
        this._.nextBag = [];
      }
      select = Math.floor(Math.random() * this._.bag.length);
      selected = (this._.bag.splice(select, 1))[0];
      this._.nextBag.push(selected);
      return selected;
    };

    return TetriminoBag;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.TetriminoBag = TetriminoBag;

}).call(this);
