// Generated by CoffeeScript 1.3.3
(function() {
  var WorkerBench, root, _ref,
    __hasProp = {}.hasOwnProperty;

  if ((_ref = window.performance) == null) {
    window.performance = {};
  }

  performance.now = (function() {
    return performance.now || performance.webkitNow || performance.msNow || performance.oNow || performance.mozNow || function() {
      return new Date().getTime();
    };
  })();

  performance.initTime = performance.now();

  WorkerBench = (function(WorkerBench) {
    var _finishedBenchmark, _generateResult, _options, _run, _runBenchmark;
    if (WorkerBench == null) {
      WorkerBench = {};
    }
    if (!((typeof Worker !== "undefined" && Worker !== null) && (typeof Worker === 'function' || typeof Worker === 'object'))) {
      WorkerBench.init = WorkerBench.run = WorkerBench.results = function() {
        console.log('WebWorkers are not available.');
        return false;
      };
    } else {
      _options = {};
      WorkerBench.result = function() {
        console.log('Benchmark not yet complete.');
        return false;
      };
      WorkerBench.init = function(options) {
        var constant, defaultOptions;
        if (options == null) {
          options = {};
        }
        _options = {};
        defaultOptions = {
          maxWorkersToTestFor: 8,
          numberOfTimesToBenchmark: 5,
          pathToWorkerScript: 'libraries/workerbench'
        };
        constant = function(key, value) {
          return Object.defineProperty(this, key, {
            get: function() {
              return value;
            },
            set: function() {
              throw Error('Cannot set value of constant!');
            }
          });
        };
        constant.call(_options, 'MAX_WORKERS_TO_TEST_FOR', options.maxWorkersToTestFor || defaultOptions.maxWorkersToTestFor);
        constant.call(_options, 'NUMBER_OF_TIMES_TO_BENCHMARK', options.numberOfTimesToBenchmark || defaultOptions.numberOfTimesToBenchmark);
        return constant.call(_options, 'PATH_TO_WORKER_SCRIPT', options.pathToWorkerScript || defaultOptions.pathToWorkerScript);
      };
      WorkerBench.start = function() {
        if (!(_options.MAX_WORKERS_TO_TEST_FOR && _options.NUMBER_OF_TIMES_TO_BENCHMARK && _options.PATH_TO_WORKER_SCRIPT)) {
          throw Error('WorkerBench.init() must be called before WorkerBench.run() is called.');
        } else {
          return _run();
        }
      };
      _run = function(workersPerBenchmark, results) {
        var _i, _ref1, _results;
        if (workersPerBenchmark == null) {
          workersPerBenchmark = (function() {
            _results = [];
            for (var _i = 1, _ref1 = _options.MAX_WORKERS_TO_TEST_FOR; 1 <= _ref1 ? _i <= _ref1 : _i >= _ref1; 1 <= _ref1 ? _i++ : _i--){ _results.push(_i); }
            return _results;
          }).apply(this);
        }
        if (results == null) {
          results = {};
        }
        if (workersPerBenchmark.length !== 0) {
          return _runBenchmark(workersPerBenchmark, results);
        } else {
          WorkerBench.result = function() {
            return _generateResult(results);
          };
          console.log("Optimum Web Workers: " + (WorkerBench.result()));
          return console.log("Benchmarks took: " + (performance.now() - performance.initTime) + ".");
        }
      };
      _runBenchmark = function(workersPerBenchmark, results, finished, workers) {
        var n, nWorkers, onMessage, start, timeout, _i, _j, _results,
          _this = this;
        if (finished == null) {
          finished = [];
        }
        if (workers == null) {
          workers = [];
        }
        nWorkers = workersPerBenchmark.shift();
        timeout = 100 / nWorkers;
        onMessage = function(e) {
          var worker, _i, _len, _ref1;
          finished.push(e.data);
          if (finished.length === nWorkers) {
            if ((_ref1 = results[nWorkers]) == null) {
              results[nWorkers] = [];
            }
            results[nWorkers].push(performance.now() - start);
            for (_i = 0, _len = workers.length; _i < _len; _i++) {
              worker = workers[_i];
              worker.terminate();
            }
            return _finishedBenchmark(nWorkers, workersPerBenchmark, results);
          }
        };
        for (n = _i = 0; 0 <= nWorkers ? _i < nWorkers : _i > nWorkers; n = 0 <= nWorkers ? ++_i : --_i) {
          workers[n] = new Worker("" + _options.PATH_TO_WORKER_SCRIPT + "/worker.js");
          workers[n].addEventListener('message', onMessage);
        }
        start = performance.now();
        _results = [];
        for (n = _j = 0; 0 <= nWorkers ? _j < nWorkers : _j > nWorkers; n = 0 <= nWorkers ? ++_j : --_j) {
          _results.push(workers[n].postMessage(timeout));
        }
        return _results;
      };
      _finishedBenchmark = function(nWorkers, workersPerBenchmark, results) {
        if (results[nWorkers].length < _options.NUMBER_OF_TIMES_TO_BENCHMARK) {
          workersPerBenchmark.unshift(nWorkers);
        } else {
          if (_options.NUMBER_OF_TIMES_TO_BENCHMARK > 2) {
            results[nWorkers] = (results[nWorkers].sort()).slice(1, results[nWorkers].length - 1);
          }
          results[nWorkers] = (results[nWorkers].reduce(function(sum, next) {
            return sum + next;
          })) / _options.NUMBER_OF_TIMES_TO_BENCHMARK;
          if (nWorkers > 2 && results[nWorkers] > results[nWorkers - 1] && results[nWorkers] > results[nWorkers - 2]) {
            workersPerBenchmark = [];
          }
        }
        return _run(workersPerBenchmark, results);
      };
      _generateResult = function(results) {
        var bestNWorkers, nWorkers, result, smallestTime;
        smallestTime = Infinity;
        bestNWorkers = 0;
        for (nWorkers in results) {
          if (!__hasProp.call(results, nWorkers)) continue;
          result = results[nWorkers];
          if (result < smallestTime) {
            smallestTime = result;
            bestNWorkers = nWorkers;
          }
        }
        return bestNWorkers;
      };
    }
    return WorkerBench;
  })();

  WorkerBench.init();

  WorkerBench.start();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.WorkerBench = WorkerBench;

}).call(this);
