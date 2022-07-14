// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"lib/arbor.js":[function(require,module,exports) {
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

//
//  arbor.js - version 0.91
//  a graph vizualization toolkit
//
//  Copyright (c) 2012 Samizdat Drafting Co.
//  Physics code derived from springy.js, copyright (c) 2010 Dennis Hotson
// 
//  Permission is hereby granted, free of charge, to any person
//  obtaining a copy of this software and associated documentation
//  files (the "Software"), to deal in the Software without
//  restriction, including without limitation the rights to use,
//  copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the
//  Software is furnished to do so, subject to the following
//  conditions:
// 
//  The above copyright notice and this permission notice shall be
//  included in all copies or substantial portions of the Software.
// 
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
//  OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
//  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
//  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
//  OTHER DEALINGS IN THE SOFTWARE.
//
(function ($) {
  /*        etc.js */
  var trace = function trace(msg) {
    if (typeof window == "undefined" || !window.console) {
      return;
    }

    var len = arguments.length;
    var args = [];

    for (var i = 0; i < len; i++) {
      args.push("arguments[" + i + "]");
    }

    eval("console.log(" + args.join(",") + ")");
  };

  var dirname = function dirname(a) {
    var b = a.replace(/^\/?(.*?)\/?$/, "$1").split("/");
    b.pop();
    return "/" + b.join("/");
  };

  var basename = function basename(b) {
    var c = b.replace(/^\/?(.*?)\/?$/, "$1").split("/");
    var a = c.pop();

    if (a == "") {
      return null;
    } else {
      return a;
    }
  };

  var _ordinalize_re = /(\d)(?=(\d\d\d)+(?!\d))/g;

  var ordinalize = function ordinalize(a) {
    var b = "" + a;

    if (a < 11000) {
      b = ("" + a).replace(_ordinalize_re, "$1,");
    } else {
      if (a < 1000000) {
        b = Math.floor(a / 1000) + "k";
      } else {
        if (a < 1000000000) {
          b = ("" + Math.floor(a / 1000)).replace(_ordinalize_re, "$1,") + "m";
        }
      }
    }

    return b;
  };

  var nano = function nano(a, b) {
    return a.replace(/\{([\w\-\.]*)}/g, function (f, c) {
      var d = c.split("."),
          e = b[d.shift()];
      $.each(d, function () {
        if (e.hasOwnProperty(this)) {
          e = e[this];
        } else {
          e = f;
        }
      });
      return e;
    });
  };

  var objcopy = function objcopy(a) {
    if (a === undefined) {
      return undefined;
    }

    if (a === null) {
      return null;
    }

    if (a.parentNode) {
      return a;
    }

    switch (_typeof(a)) {
      case "string":
        return a.substring(0);
        break;

      case "number":
        return a + 0;
        break;

      case "boolean":
        return a === true;
        break;
    }

    var b = $.isArray(a) ? [] : {};
    $.each(a, function (d, c) {
      b[d] = objcopy(c);
    });
    return b;
  };

  var objmerge = function objmerge(d, b) {
    d = d || {};
    b = b || {};
    var c = objcopy(d);

    for (var a in b) {
      c[a] = b[a];
    }

    return c;
  };

  var objcmp = function objcmp(e, c, d) {
    if (!e || !c) {
      return e === c;
    }

    if (_typeof(e) != _typeof(c)) {
      return false;
    }

    if (_typeof(e) != "object") {
      return e === c;
    } else {
      if ($.isArray(e)) {
        if (!$.isArray(c)) {
          return false;
        }

        if (e.length != c.length) {
          return false;
        }
      } else {
        var h = [];

        for (var f in e) {
          if (e.hasOwnProperty(f)) {
            h.push(f);
          }
        }

        var g = [];

        for (var f in c) {
          if (c.hasOwnProperty(f)) {
            g.push(f);
          }
        }

        if (!d) {
          h.sort();
          g.sort();
        }

        if (h.join(",") !== g.join(",")) {
          return false;
        }
      }

      var i = true;
      $.each(e, function (a) {
        var b = objcmp(e[a], c[a]);
        i = i && b;

        if (!i) {
          return false;
        }
      });
      return i;
    }
  };

  var objkeys = function objkeys(b) {
    var a = [];
    $.each(b, function (d, c) {
      if (b.hasOwnProperty(d)) {
        a.push(d);
      }
    });
    return a;
  };

  var objcontains = function objcontains(c) {
    if (!c || _typeof(c) != "object") {
      return false;
    }

    for (var b = 1, a = arguments.length; b < a; b++) {
      if (c.hasOwnProperty(arguments[b])) {
        return true;
      }
    }

    return false;
  };

  var uniq = function uniq(b) {
    var a = b.length;
    var d = {};

    for (var c = 0; c < a; c++) {
      d[b[c]] = true;
    }

    return objkeys(d);
  };

  var arbor_path = function arbor_path() {
    var a = $("script").map(function (b) {
      var c = $(this).attr("src");

      if (!c) {
        return;
      }

      if (c.match(/arbor[^\/\.]*.js|dev.js/)) {
        return c.match(/.*\//) || "/";
      }
    });

    if (a.length > 0) {
      return a[0];
    } else {
      return null;
    }
  };
  /*     kernel.js */


  var Kernel = function Kernel(b) {
    var k = window.location.protocol == "file:" && navigator.userAgent.toLowerCase().indexOf("chrome") > -1;
    var a = window.Worker !== undefined && !k;
    var i = null;
    var c = null;
    var f = [];
    f.last = new Date();
    var l = null;
    var e = null;
    var d = null;
    var h = null;
    var g = false;
    var j = {
      system: b,
      tween: null,
      nodes: {},
      init: function init() {
        if (typeof Tween != "undefined") {
          c = Tween();
        } else {
          if (typeof arbor.Tween != "undefined") {
            c = arbor.Tween();
          } else {
            c = {
              busy: function busy() {
                return false;
              },
              tick: function tick() {
                return true;
              },
              to: function to() {
                trace("Please include arbor-tween.js to enable tweens");

                c.to = function () {};

                return;
              }
            };
          }
        }

        j.tween = c;
        var m = b.parameters();

        if (a) {
          trace("arbor.js/web-workers", m);
          l = setInterval(j.screenUpdate, m.timeout);
          i = new Worker(arbor_path() + "arbor.js");
          i.onmessage = j.workerMsg;

          i.onerror = function (n) {
            trace("physics:", n);
          };

          i.postMessage({
            type: "physics",
            physics: objmerge(m, {
              timeout: Math.ceil(m.timeout)
            })
          });
        } else {
          trace("arbor.js/single-threaded", m);
          i = Physics(m.dt, m.stiffness, m.repulsion, m.friction, j.system._updateGeometry, m.integrator);
          j.start();
        }

        return j;
      },
      graphChanged: function graphChanged(m) {
        if (a) {
          i.postMessage({
            type: "changes",
            changes: m
          });
        } else {
          i._update(m);
        }

        j.start();
      },
      particleModified: function particleModified(n, m) {
        if (a) {
          i.postMessage({
            type: "modify",
            id: n,
            mods: m
          });
        } else {
          i.modifyNode(n, m);
        }

        j.start();
      },
      physicsModified: function physicsModified(m) {
        if (!isNaN(m.timeout)) {
          if (a) {
            clearInterval(l);
            l = setInterval(j.screenUpdate, m.timeout);
          } else {
            clearInterval(d);
            d = null;
          }
        }

        if (a) {
          i.postMessage({
            type: "sys",
            param: m
          });
        } else {
          i.modifyPhysics(m);
        }

        j.start();
      },
      workerMsg: function workerMsg(n) {
        var m = n.data.type;

        if (m == "geometry") {
          j.workerUpdate(n.data);
        } else {
          trace("physics:", n.data);
        }
      },
      _lastPositions: null,
      workerUpdate: function workerUpdate(m) {
        j._lastPositions = m;
        j._lastBounds = m.bounds;
      },
      _lastFrametime: new Date().valueOf(),
      _lastBounds: null,
      _currentRenderer: null,
      screenUpdate: function screenUpdate() {
        var n = new Date().valueOf();
        var m = false;

        if (j._lastPositions !== null) {
          j.system._updateGeometry(j._lastPositions);

          j._lastPositions = null;
          m = true;
        }

        if (c && c.busy()) {
          m = true;
        }

        if (j.system._updateBounds(j._lastBounds)) {
          m = true;
        }

        if (m) {
          var o = j.system.renderer;

          if (o !== undefined) {
            if (o !== e) {
              o.init(j.system);
              e = o;
            }

            if (c) {
              c.tick();
            }

            o.redraw();
            var p = f.last;
            f.last = new Date();
            f.push(f.last - p);

            if (f.length > 50) {
              f.shift();
            }
          }
        }
      },
      physicsUpdate: function physicsUpdate() {
        if (c) {
          c.tick();
        }

        i.tick();

        var n = j.system._updateBounds();

        if (c && c.busy()) {
          n = true;
        }

        var o = j.system.renderer;
        var m = new Date();
        var o = j.system.renderer;

        if (o !== undefined) {
          if (o !== e) {
            o.init(j.system);
            e = o;
          }

          o.redraw({
            timestamp: m
          });
        }

        var q = f.last;
        f.last = m;
        f.push(f.last - q);

        if (f.length > 50) {
          f.shift();
        }

        var p = i.systemEnergy();

        if ((p.mean + p.max) / 2 < 0.05) {
          if (h === null) {
            h = new Date().valueOf();
          }

          if (new Date().valueOf() - h > 1000) {
            clearInterval(d);
            d = null;
          } else {}
        } else {
          h = null;
        }
      },
      fps: function fps(n) {
        if (n !== undefined) {
          var q = 1000 / Math.max(1, targetFps);
          j.physicsModified({
            timeout: q
          });
        }

        var r = 0;

        for (var p = 0, o = f.length; p < o; p++) {
          r += f[p];
        }

        var m = r / Math.max(1, f.length);

        if (!isNaN(m)) {
          return Math.round(1000 / m);
        } else {
          return 0;
        }
      },
      start: function start(m) {
        if (d !== null) {
          return;
        }

        if (g && !m) {
          return;
        }

        g = false;

        if (a) {
          i.postMessage({
            type: "start"
          });
        } else {
          h = null;
          d = setInterval(j.physicsUpdate, j.system.parameters().timeout);
        }
      },
      stop: function stop() {
        g = true;

        if (a) {
          i.postMessage({
            type: "stop"
          });
        } else {
          if (d !== null) {
            clearInterval(d);
            d = null;
          }
        }
      }
    };
    return j.init();
  };
  /*      atoms.js */


  var Node = function Node(a) {
    this._id = _nextNodeId++;
    this.data = a || {};
    this._mass = a.mass !== undefined ? a.mass : 1;
    this._fixed = a.fixed === true ? true : false;
    this._p = new _Point(typeof a.x == "number" ? a.x : null, typeof a.y == "number" ? a.y : null);
    delete this.data.x;
    delete this.data.y;
    delete this.data.mass;
    delete this.data.fixed;
  };

  var _nextNodeId = 1;

  var Edge = function Edge(b, c, a) {
    this._id = _nextEdgeId--;
    this.source = b;
    this.target = c;
    this.length = a.length !== undefined ? a.length : 1;
    this.data = a !== undefined ? a : {};
    delete this.data.length;
  };

  var _nextEdgeId = -1;

  var Particle = function Particle(a, b) {
    this.p = a;
    this.m = b;
    this.v = new _Point(0, 0);
    this.f = new _Point(0, 0);
  };

  Particle.prototype.applyForce = function (a) {
    this.f = this.f.add(a.divide(this.m));
  };

  var Spring = function Spring(c, b, d, a) {
    this.point1 = c;
    this.point2 = b;
    this.length = d;
    this.k = a;
  };

  Spring.prototype.distanceToParticle = function (a) {
    var c = that.point2.p.subtract(that.point1.p).normalize().normal();
    var b = a.p.subtract(that.point1.p);
    return Math.abs(b.x * c.x + b.y * c.y);
  };

  var _Point = function Point(a, b) {
    if (a && a.hasOwnProperty("y")) {
      b = a.y;
      a = a.x;
    }

    this.x = a;
    this.y = b;
  };

  _Point.random = function (a) {
    a = a !== undefined ? a : 5;
    return new _Point(2 * a * (Math.random() - 0.5), 2 * a * (Math.random() - 0.5));
  };

  _Point.prototype = {
    exploded: function exploded() {
      return isNaN(this.x) || isNaN(this.y);
    },
    add: function add(a) {
      return new _Point(this.x + a.x, this.y + a.y);
    },
    subtract: function subtract(a) {
      return new _Point(this.x - a.x, this.y - a.y);
    },
    multiply: function multiply(a) {
      return new _Point(this.x * a, this.y * a);
    },
    divide: function divide(a) {
      return new _Point(this.x / a, this.y / a);
    },
    magnitude: function magnitude() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    normal: function normal() {
      return new _Point(-this.y, this.x);
    },
    normalize: function normalize() {
      return this.divide(this.magnitude());
    }
  };
  /*     system.js */

  var ParticleSystem = function ParticleSystem(e, r, f, g, u, m, s, a) {
    var k = [];
    var i = null;
    var l = 0;
    var v = null;
    var n = 0.04;
    var j = [20, 20, 20, 20];
    var o = null;
    var p = null;

    if (_typeof(e) == "object") {
      var t = e;
      f = t.friction;
      e = t.repulsion;
      u = t.fps;
      m = t.dt;
      r = t.stiffness;
      g = t.gravity;
      s = t.precision;
      a = t.integrator;
    }

    if (a != "verlet" && a != "euler") {
      a = "verlet";
    }

    f = isNaN(f) ? 0.5 : f;
    e = isNaN(e) ? 1000 : e;
    u = isNaN(u) ? 55 : u;
    r = isNaN(r) ? 600 : r;
    m = isNaN(m) ? 0.02 : m;
    s = isNaN(s) ? 0.6 : s;
    g = g === true;
    var q = u !== undefined ? 1000 / u : 1000 / 50;
    var c = {
      integrator: a,
      repulsion: e,
      stiffness: r,
      friction: f,
      dt: m,
      gravity: g,
      precision: s,
      timeout: q
    };
    var b;
    var d = {
      renderer: null,
      tween: null,
      nodes: {},
      edges: {},
      adjacency: {},
      names: {},
      kernel: null
    };
    var h = {
      parameters: function parameters(w) {
        if (w !== undefined) {
          if (!isNaN(w.precision)) {
            w.precision = Math.max(0, Math.min(1, w.precision));
          }

          $.each(c, function (y, x) {
            if (w[y] !== undefined) {
              c[y] = w[y];
            }
          });
          d.kernel.physicsModified(w);
        }

        return c;
      },
      fps: function fps(w) {
        if (w === undefined) {
          return d.kernel.fps();
        } else {
          h.parameters({
            timeout: 1000 / (w || 50)
          });
        }
      },
      start: function start() {
        d.kernel.start();
      },
      stop: function stop() {
        d.kernel.stop();
      },
      addNode: function addNode(z, C) {
        C = C || {};
        var D = d.names[z];

        if (D) {
          D.data = C;
          return D;
        } else {
          if (z != undefined) {
            var w = C.x != undefined ? C.x : null;
            var E = C.y != undefined ? C.y : null;
            var B = C.fixed ? 1 : 0;
            var A = new Node(C);
            A.name = z;
            d.names[z] = A;
            d.nodes[A._id] = A;
            k.push({
              t: "addNode",
              id: A._id,
              m: A.mass,
              x: w,
              y: E,
              f: B
            });

            h._notify();

            return A;
          }
        }
      },
      pruneNode: function pruneNode(x) {
        var w = h.getNode(x);

        if (typeof d.nodes[w._id] !== "undefined") {
          delete d.nodes[w._id];
          delete d.names[w.name];
        }

        $.each(d.edges, function (z, y) {
          if (y.source._id === w._id || y.target._id === w._id) {
            h.pruneEdge(y);
          }
        });
        k.push({
          t: "dropNode",
          id: w._id
        });

        h._notify();
      },
      getNode: function getNode(w) {
        if (w._id !== undefined) {
          return w;
        } else {
          if (typeof w == "string" || typeof w == "number") {
            return d.names[w];
          }
        }
      },
      eachNode: function eachNode(w) {
        $.each(d.nodes, function (z, y) {
          if (y._p.x == null || y._p.y == null) {
            return;
          }

          var x = v !== null ? h.toScreen(y._p) : y._p;
          w.call(h, y, x);
        });
      },
      addEdge: function addEdge(A, B, z) {
        A = h.getNode(A) || h.addNode(A);
        B = h.getNode(B) || h.addNode(B);
        z = z || {};
        var y = new Edge(A, B, z);
        var C = A._id;
        var D = B._id;
        d.adjacency[C] = d.adjacency[C] || {};
        d.adjacency[C][D] = d.adjacency[C][D] || [];
        var x = d.adjacency[C][D].length > 0;

        if (x) {
          $.extend(d.adjacency[C][D].data, y.data);
          return;
        } else {
          d.edges[y._id] = y;
          d.adjacency[C][D].push(y);
          var w = y.length !== undefined ? y.length : 1;
          k.push({
            t: "addSpring",
            id: y._id,
            fm: C,
            to: D,
            l: w
          });

          h._notify();
        }

        return y;
      },
      pruneEdge: function pruneEdge(B) {
        k.push({
          t: "dropSpring",
          id: B._id
        });
        delete d.edges[B._id];

        for (var w in d.adjacency) {
          for (var C in d.adjacency[w]) {
            var z = d.adjacency[w][C];

            for (var A = z.length - 1; A >= 0; A--) {
              if (d.adjacency[w][C][A]._id === B._id) {
                d.adjacency[w][C].splice(A, 1);
              }
            }
          }
        }

        h._notify();
      },
      getEdges: function getEdges(x, w) {
        x = h.getNode(x);
        w = h.getNode(w);

        if (!x || !w) {
          return [];
        }

        if (typeof d.adjacency[x._id] !== "undefined" && typeof d.adjacency[x._id][w._id] !== "undefined") {
          return d.adjacency[x._id][w._id];
        }

        return [];
      },
      getEdgesFrom: function getEdgesFrom(w) {
        w = h.getNode(w);

        if (!w) {
          return [];
        }

        if (typeof d.adjacency[w._id] !== "undefined") {
          var x = [];
          $.each(d.adjacency[w._id], function (z, y) {
            x = x.concat(y);
          });
          return x;
        }

        return [];
      },
      getEdgesTo: function getEdgesTo(w) {
        w = h.getNode(w);

        if (!w) {
          return [];
        }

        var x = [];
        $.each(d.edges, function (z, y) {
          if (y.target == w) {
            x.push(y);
          }
        });
        return x;
      },
      eachEdge: function eachEdge(w) {
        $.each(d.edges, function (A, y) {
          var z = d.nodes[y.source._id]._p;
          var x = d.nodes[y.target._id]._p;

          if (z.x == null || x.x == null) {
            return;
          }

          z = v !== null ? h.toScreen(z) : z;
          x = v !== null ? h.toScreen(x) : x;

          if (z && x) {
            w.call(h, y, z, x);
          }
        });
      },
      prune: function prune(x) {
        var w = {
          dropped: {
            nodes: [],
            edges: []
          }
        };

        if (x === undefined) {
          $.each(d.nodes, function (z, y) {
            w.dropped.nodes.push(y);
            h.pruneNode(y);
          });
        } else {
          h.eachNode(function (z) {
            var y = x.call(h, z, {
              from: h.getEdgesFrom(z),
              to: h.getEdgesTo(z)
            });

            if (y) {
              w.dropped.nodes.push(z);
              h.pruneNode(z);
            }
          });
        }

        return w;
      },
      graft: function graft(x) {
        var w = {
          added: {
            nodes: [],
            edges: []
          }
        };

        if (x.nodes) {
          $.each(x.nodes, function (z, y) {
            var A = h.getNode(z);

            if (A) {
              A.data = y;
            } else {
              w.added.nodes.push(h.addNode(z, y));
            }

            d.kernel.start();
          });
        }

        if (x.edges) {
          $.each(x.edges, function (A, y) {
            var z = h.getNode(A);

            if (!z) {
              w.added.nodes.push(h.addNode(A, {}));
            }

            $.each(y, function (E, B) {
              var D = h.getNode(E);

              if (!D) {
                w.added.nodes.push(h.addNode(E, {}));
              }

              var C = h.getEdges(A, E);

              if (C.length > 0) {
                C[0].data = B;
              } else {
                w.added.edges.push(h.addEdge(A, E, B));
              }
            });
          });
        }

        return w;
      },
      merge: function merge(x) {
        var w = {
          added: {
            nodes: [],
            edges: []
          },
          dropped: {
            nodes: [],
            edges: []
          }
        };
        $.each(d.edges, function (B, A) {
          if (x.edges[A.source.name] === undefined || x.edges[A.source.name][A.target.name] === undefined) {
            h.pruneEdge(A);
            w.dropped.edges.push(A);
          }
        });
        var z = h.prune(function (B, A) {
          if (x.nodes[B.name] === undefined) {
            w.dropped.nodes.push(B);
            return true;
          }
        });
        var y = h.graft(x);
        w.added.nodes = w.added.nodes.concat(y.added.nodes);
        w.added.edges = w.added.edges.concat(y.added.edges);
        w.dropped.nodes = w.dropped.nodes.concat(z.dropped.nodes);
        w.dropped.edges = w.dropped.edges.concat(z.dropped.edges);
        return w;
      },
      tweenNode: function tweenNode(z, w, y) {
        var x = h.getNode(z);

        if (x) {
          d.tween.to(x, w, y);
        }
      },
      tweenEdge: function tweenEdge(x, w, A, z) {
        if (z === undefined) {
          h._tweenEdge(x, w, A);
        } else {
          var y = h.getEdges(x, w);
          $.each(y, function (B, C) {
            h._tweenEdge(C, A, z);
          });
        }
      },
      _tweenEdge: function _tweenEdge(x, w, y) {
        if (x && x._id !== undefined) {
          d.tween.to(x, w, y);
        }
      },
      _updateGeometry: function _updateGeometry(z) {
        if (z != undefined) {
          var w = z.epoch < l;
          b = z.energy;
          var A = z.geometry;

          if (A !== undefined) {
            for (var y = 0, x = A.length / 3; y < x; y++) {
              var B = A[3 * y];

              if (w && d.nodes[B] == undefined) {
                continue;
              }

              d.nodes[B]._p.x = A[3 * y + 1];
              d.nodes[B]._p.y = A[3 * y + 2];
            }
          }
        }
      },
      screen: function screen(w) {
        if (w == undefined) {
          return {
            size: v ? objcopy(v) : undefined,
            padding: j.concat(),
            step: n
          };
        }

        if (w.size !== undefined) {
          h.screenSize(w.size.width, w.size.height);
        }

        if (!isNaN(w.step)) {
          h.screenStep(w.step);
        }

        if (w.padding !== undefined) {
          h.screenPadding(w.padding);
        }
      },
      screenSize: function screenSize(w, x) {
        v = {
          width: w,
          height: x
        };

        h._updateBounds();
      },
      screenPadding: function screenPadding(z, A, w, x) {
        if ($.isArray(z)) {
          trbl = z;
        } else {
          trbl = [z, A, w, x];
        }

        var B = trbl[0];
        var y = trbl[1];
        var C = trbl[2];

        if (y === undefined) {
          trbl = [B, B, B, B];
        } else {
          if (C == undefined) {
            trbl = [B, y, B, y];
          }
        }

        j = trbl;
      },
      screenStep: function screenStep(w) {
        n = w;
      },
      toScreen: function toScreen(y) {
        if (!o || !v) {
          return;
        }

        var x = j || [0, 0, 0, 0];
        var w = o.bottomright.subtract(o.topleft);
        var A = x[3] + y.subtract(o.topleft).divide(w.x).x * (v.width - (x[1] + x[3]));
        var z = x[0] + y.subtract(o.topleft).divide(w.y).y * (v.height - (x[0] + x[2]));
        return arbor.Point(A, z);
      },
      fromScreen: function fromScreen(A) {
        if (!o || !v) {
          return;
        }

        var z = j || [0, 0, 0, 0];
        var y = o.bottomright.subtract(o.topleft);
        var x = (A.x - z[3]) / (v.width - (z[1] + z[3])) * y.x + o.topleft.x;
        var w = (A.y - z[0]) / (v.height - (z[0] + z[2])) * y.y + o.topleft.y;
        return arbor.Point(x, w);
      },
      _updateBounds: function _updateBounds(x) {
        if (v === null) {
          return;
        }

        if (x) {
          p = x;
        } else {
          p = h.bounds();
        }

        var A = new _Point(p.bottomright.x, p.bottomright.y);
        var z = new _Point(p.topleft.x, p.topleft.y);
        var C = A.subtract(z);
        var w = z.add(C.divide(2));
        var y = 4;
        var E = new _Point(Math.max(C.x, y), Math.max(C.y, y));
        p.topleft = w.subtract(E.divide(2));
        p.bottomright = w.add(E.divide(2));

        if (!o) {
          if ($.isEmptyObject(d.nodes)) {
            return false;
          }

          o = p;
          return true;
        }

        var D = n;
        _newBounds = {
          bottomright: o.bottomright.add(p.bottomright.subtract(o.bottomright).multiply(D)),
          topleft: o.topleft.add(p.topleft.subtract(o.topleft).multiply(D))
        };
        var B = new _Point(o.topleft.subtract(_newBounds.topleft).magnitude(), o.bottomright.subtract(_newBounds.bottomright).magnitude());

        if (B.x * v.width > 1 || B.y * v.height > 1) {
          o = _newBounds;
          return true;
        } else {
          return false;
        }
      },
      energy: function energy() {
        return b;
      },
      bounds: function bounds() {
        var x = null;
        var w = null;
        $.each(d.nodes, function (A, z) {
          if (!x) {
            x = new _Point(z._p);
            w = new _Point(z._p);
            return;
          }

          var y = z._p;

          if (y.x === null || y.y === null) {
            return;
          }

          if (y.x > x.x) {
            x.x = y.x;
          }

          if (y.y > x.y) {
            x.y = y.y;
          }

          if (y.x < w.x) {
            w.x = y.x;
          }

          if (y.y < w.y) {
            w.y = y.y;
          }
        });

        if (x && w) {
          return {
            bottomright: x,
            topleft: w
          };
        } else {
          return {
            topleft: new _Point(-1, -1),
            bottomright: new _Point(1, 1)
          };
        }
      },
      nearest: function nearest(y) {
        if (v !== null) {
          y = h.fromScreen(y);
        }

        var x = {
          node: null,
          point: null,
          distance: null
        };
        var w = h;
        $.each(d.nodes, function (C, z) {
          var A = z._p;

          if (A.x === null || A.y === null) {
            return;
          }

          var B = A.subtract(y).magnitude();

          if (x.distance === null || B < x.distance) {
            x = {
              node: z,
              point: A,
              distance: B
            };

            if (v !== null) {
              x.screenPoint = h.toScreen(A);
            }
          }
        });

        if (x.node) {
          if (v !== null) {
            x.distance = h.toScreen(x.node.p).subtract(h.toScreen(y)).magnitude();
          }

          return x;
        } else {
          return null;
        }
      },
      _notify: function _notify() {
        if (i === null) {
          l++;
        } else {
          clearTimeout(i);
        }

        i = setTimeout(h._synchronize, 20);
      },
      _synchronize: function _synchronize() {
        if (k.length > 0) {
          d.kernel.graphChanged(k);
          k = [];
          i = null;
        }
      }
    };
    d.kernel = Kernel(h);
    d.tween = d.kernel.tween || null;

    Node.prototype.__defineGetter__("p", function () {
      var x = this;
      var w = {};

      w.__defineGetter__("x", function () {
        return x._p.x;
      });

      w.__defineSetter__("x", function (y) {
        d.kernel.particleModified(x._id, {
          x: y
        });
      });

      w.__defineGetter__("y", function () {
        return x._p.y;
      });

      w.__defineSetter__("y", function (y) {
        d.kernel.particleModified(x._id, {
          y: y
        });
      });

      w.__proto__ = _Point.prototype;
      return w;
    });

    Node.prototype.__defineSetter__("p", function (w) {
      this._p.x = w.x;
      this._p.y = w.y;
      d.kernel.particleModified(this._id, {
        x: w.x,
        y: w.y
      });
    });

    Node.prototype.__defineGetter__("mass", function () {
      return this._mass;
    });

    Node.prototype.__defineSetter__("mass", function (w) {
      this._mass = w;
      d.kernel.particleModified(this._id, {
        m: w
      });
    });

    Node.prototype.__defineSetter__("tempMass", function (w) {
      d.kernel.particleModified(this._id, {
        _m: w
      });
    });

    Node.prototype.__defineGetter__("fixed", function () {
      return this._fixed;
    });

    Node.prototype.__defineSetter__("fixed", function (w) {
      this._fixed = w;
      d.kernel.particleModified(this._id, {
        f: w ? 1 : 0
      });
    });

    return h;
  };
  /* barnes-hut.js */


  var BarnesHutTree = function BarnesHutTree() {
    var b = [];
    var a = 0;
    var e = null;
    var d = 0.5;
    var c = {
      init: function init(g, h, f) {
        d = f;
        a = 0;
        e = c._newBranch();
        e.origin = g;
        e.size = h.subtract(g);
      },
      insert: function insert(j) {
        var f = e;
        var g = [j];

        while (g.length) {
          var h = g.shift();
          var m = h._m || h.m;

          var p = c._whichQuad(h, f);

          if (f[p] === undefined) {
            f[p] = h;
            f.mass += m;

            if (f.p) {
              f.p = f.p.add(h.p.multiply(m));
            } else {
              f.p = h.p.multiply(m);
            }
          } else {
            if ("origin" in f[p]) {
              f.mass += m;

              if (f.p) {
                f.p = f.p.add(h.p.multiply(m));
              } else {
                f.p = h.p.multiply(m);
              }

              f = f[p];
              g.unshift(h);
            } else {
              var l = f.size.divide(2);
              var n = new _Point(f.origin);

              if (p[0] == "s") {
                n.y += l.y;
              }

              if (p[1] == "e") {
                n.x += l.x;
              }

              var o = f[p];
              f[p] = c._newBranch();
              f[p].origin = n;
              f[p].size = l;
              f.mass = m;
              f.p = h.p.multiply(m);
              f = f[p];

              if (o.p.x === h.p.x && o.p.y === h.p.y) {
                var k = l.x * 0.08;
                var i = l.y * 0.08;
                o.p.x = Math.min(n.x + l.x, Math.max(n.x, o.p.x - k / 2 + Math.random() * k));
                o.p.y = Math.min(n.y + l.y, Math.max(n.y, o.p.y - i / 2 + Math.random() * i));
              }

              g.push(o);
              g.unshift(h);
            }
          }
        }
      },
      applyForces: function applyForces(m, g) {
        var f = [e];

        while (f.length) {
          node = f.shift();

          if (node === undefined) {
            continue;
          }

          if (m === node) {
            continue;
          }

          if ("f" in node) {
            var k = m.p.subtract(node.p);
            var l = Math.max(1, k.magnitude());
            var i = (k.magnitude() > 0 ? k : _Point.random(1)).normalize();
            m.applyForce(i.multiply(g * (node._m || node.m)).divide(l * l));
          } else {
            var j = m.p.subtract(node.p.divide(node.mass)).magnitude();
            var h = Math.sqrt(node.size.x * node.size.y);

            if (h / j > d) {
              f.push(node.ne);
              f.push(node.nw);
              f.push(node.se);
              f.push(node.sw);
            } else {
              var k = m.p.subtract(node.p.divide(node.mass));
              var l = Math.max(1, k.magnitude());
              var i = (k.magnitude() > 0 ? k : _Point.random(1)).normalize();
              m.applyForce(i.multiply(g * node.mass).divide(l * l));
            }
          }
        }
      },
      _whichQuad: function _whichQuad(i, f) {
        if (i.p.exploded()) {
          return null;
        }

        var h = i.p.subtract(f.origin);
        var g = f.size.divide(2);

        if (h.y < g.y) {
          if (h.x < g.x) {
            return "nw";
          } else {
            return "ne";
          }
        } else {
          if (h.x < g.x) {
            return "sw";
          } else {
            return "se";
          }
        }
      },
      _newBranch: function _newBranch() {
        if (b[a]) {
          var f = b[a];
          f.ne = f.nw = f.se = f.sw = undefined;
          f.mass = 0;
          delete f.p;
        } else {
          f = {
            origin: null,
            size: null,
            nw: undefined,
            ne: undefined,
            sw: undefined,
            se: undefined,
            mass: 0
          };
          b[a] = f;
        }

        a++;
        return f;
      }
    };
    return c;
  };
  /*    physics.js */


  var Physics = function Physics(a, m, n, e, h, o) {
    var f = BarnesHutTree();
    var c = {
      particles: {},
      springs: {}
    };
    var l = {
      particles: {}
    };
    var p = [];
    var k = [];
    var d = 0;
    var b = {
      sum: 0,
      max: 0,
      mean: 0
    };
    var g = {
      topleft: new _Point(-1, -1),
      bottomright: new _Point(1, 1)
    };
    var j = 1000;
    var i = {
      integrator: ["verlet", "euler"].indexOf(o) >= 0 ? o : "verlet",
      stiffness: m !== undefined ? m : 1000,
      repulsion: n !== undefined ? n : 600,
      friction: e !== undefined ? e : 0.3,
      gravity: false,
      dt: a !== undefined ? a : 0.02,
      theta: 0.4,
      init: function init() {
        return i;
      },
      modifyPhysics: function modifyPhysics(q) {
        $.each(["stiffness", "repulsion", "friction", "gravity", "dt", "precision", "integrator"], function (s, t) {
          if (q[t] !== undefined) {
            if (t == "precision") {
              i.theta = 1 - q[t];
              return;
            }

            i[t] = q[t];

            if (t == "stiffness") {
              var r = q[t];
              $.each(c.springs, function (v, u) {
                u.k = r;
              });
            }
          }
        });
      },
      addNode: function addNode(v) {
        var u = v.id;
        var r = v.m;
        var q = g.bottomright.x - g.topleft.x;
        var t = g.bottomright.y - g.topleft.y;
        var s = new _Point(v.x != null ? v.x : g.topleft.x + q * Math.random(), v.y != null ? v.y : g.topleft.y + t * Math.random());
        c.particles[u] = new Particle(s, r);
        c.particles[u].connections = 0;
        c.particles[u].fixed = v.f === 1;
        l.particles[u] = c.particles[u];
        p.push(c.particles[u]);
      },
      dropNode: function dropNode(t) {
        var s = t.id;
        var r = c.particles[s];
        var q = $.inArray(r, p);

        if (q > -1) {
          p.splice(q, 1);
        }

        delete c.particles[s];
        delete l.particles[s];
      },
      modifyNode: function modifyNode(s, q) {
        if (s in c.particles) {
          var r = c.particles[s];

          if ("x" in q) {
            r.p.x = q.x;
          }

          if ("y" in q) {
            r.p.y = q.y;
          }

          if ("m" in q) {
            r.m = q.m;
          }

          if ("f" in q) {
            r.fixed = q.f === 1;
          }

          if ("_m" in q) {
            if (r._m === undefined) {
              r._m = r.m;
            }

            r.m = q._m;
          }
        }
      },
      addSpring: function addSpring(u) {
        var t = u.id;
        var q = u.l;
        var s = c.particles[u.fm];
        var r = c.particles[u.to];

        if (s !== undefined && r !== undefined) {
          c.springs[t] = new Spring(s, r, q, i.stiffness);
          k.push(c.springs[t]);
          s.connections++;
          r.connections++;
          delete l.particles[u.fm];
          delete l.particles[u.to];
        }
      },
      dropSpring: function dropSpring(t) {
        var s = t.id;
        var r = c.springs[s];
        r.point1.connections--;
        r.point2.connections--;
        var q = $.inArray(r, k);

        if (q > -1) {
          k.splice(q, 1);
        }

        delete c.springs[s];
      },
      _update: function _update(q) {
        d++;
        $.each(q, function (r, s) {
          if (s.t in i) {
            i[s.t](s);
          }
        });
        return d;
      },
      tick: function tick() {
        i.tendParticles();

        if (i.integrator == "euler") {
          i.updateForces();
          i.updateVelocity(i.dt);
          i.updatePosition(i.dt);
        } else {
          i.updateForces();
          i.cacheForces();
          i.updatePosition(i.dt);
          i.updateForces();
          i.updateVelocity(i.dt);
        }

        i.tock();
      },
      tock: function tock() {
        var q = [];
        $.each(c.particles, function (s, r) {
          q.push(s);
          q.push(r.p.x);
          q.push(r.p.y);
        });

        if (h) {
          h({
            geometry: q,
            epoch: d,
            energy: b,
            bounds: g
          });
        }
      },
      tendParticles: function tendParticles() {
        $.each(c.particles, function (r, q) {
          if (q._m !== undefined) {
            if (Math.abs(q.m - q._m) < 1) {
              q.m = q._m;
              delete q._m;
            } else {
              q.m *= 0.98;
            }
          }

          q.v.x = q.v.y = 0;
        });
      },
      updateForces: function updateForces() {
        if (i.repulsion > 0) {
          if (i.theta > 0) {
            i.applyBarnesHutRepulsion();
          } else {
            i.applyBruteForceRepulsion();
          }
        }

        if (i.stiffness > 0) {
          i.applySprings();
        }

        i.applyCenterDrift();

        if (i.gravity) {
          i.applyCenterGravity();
        }
      },
      cacheForces: function cacheForces() {
        $.each(c.particles, function (r, q) {
          q._F = q.f;
        });
      },
      applyBruteForceRepulsion: function applyBruteForceRepulsion() {
        $.each(c.particles, function (r, q) {
          $.each(c.particles, function (t, s) {
            if (q !== s) {
              var v = q.p.subtract(s.p);
              var w = Math.max(1, v.magnitude());
              var u = (v.magnitude() > 0 ? v : _Point.random(1)).normalize();
              q.applyForce(u.multiply(i.repulsion * (s._m || s.m) * 0.5).divide(w * w * 0.5));
              s.applyForce(u.multiply(i.repulsion * (q._m || q.m) * 0.5).divide(w * w * -0.5));
            }
          });
        });
      },
      applyBarnesHutRepulsion: function applyBarnesHutRepulsion() {
        if (!g.topleft || !g.bottomright) {
          return;
        }

        var r = new _Point(g.bottomright);
        var q = new _Point(g.topleft);
        f.init(q, r, i.theta);
        $.each(c.particles, function (t, s) {
          f.insert(s);
        });
        $.each(c.particles, function (t, s) {
          f.applyForces(s, i.repulsion);
        });
      },
      applySprings: function applySprings() {
        $.each(c.springs, function (u, q) {
          var t = q.point2.p.subtract(q.point1.p);
          var r = q.length - t.magnitude();
          var s = (t.magnitude() > 0 ? t : _Point.random(1)).normalize();
          q.point1.applyForce(s.multiply(q.k * r * -0.5));
          q.point2.applyForce(s.multiply(q.k * r * 0.5));
        });
      },
      applyCenterDrift: function applyCenterDrift() {
        var r = 0;
        var s = new _Point(0, 0);
        $.each(c.particles, function (u, t) {
          s.add(t.p);
          r++;
        });

        if (r == 0) {
          return;
        }

        var q = s.divide(-r);
        $.each(c.particles, function (u, t) {
          t.applyForce(q);
        });
      },
      applyCenterGravity: function applyCenterGravity() {
        $.each(c.particles, function (s, q) {
          var r = q.p.multiply(-1);
          q.applyForce(r.multiply(i.repulsion / 100));
        });
      },
      updateVelocity: function updateVelocity(r) {
        var s = 0,
            q = 0,
            t = 0;
        $.each(c.particles, function (x, u) {
          if (u.fixed) {
            u.v = new _Point(0, 0);
            u.f = new _Point(0, 0);
            return;
          }

          if (i.integrator == "euler") {
            u.v = u.v.add(u.f.multiply(r)).multiply(1 - i.friction);
          } else {
            u.v = u.v.add(u.f.add(u._F.divide(u._m)).multiply(r * 0.5)).multiply(1 - i.friction);
          }

          u.f.x = u.f.y = 0;
          var v = u.v.magnitude();

          if (v > j) {
            u.v = u.v.divide(v * v);
          }

          var v = u.v.magnitude();
          var w = v * v;
          s += w;
          q = Math.max(w, q);
          t++;
        });
        b = {
          sum: s,
          max: q,
          mean: s / t,
          n: t
        };
      },
      updatePosition: function updatePosition(q) {
        var s = null;
        var r = null;
        $.each(c.particles, function (v, u) {
          if (i.integrator == "euler") {
            u.p = u.p.add(u.v.multiply(q));
          } else {
            var t = u.f.multiply(0.5 * q * q).divide(u.m);
            u.p = u.p.add(u.v.multiply(q)).add(t);
          }

          if (!s) {
            s = new _Point(u.p.x, u.p.y);
            r = new _Point(u.p.x, u.p.y);
            return;
          }

          var w = u.p;

          if (w.x === null || w.y === null) {
            return;
          }

          if (w.x > s.x) {
            s.x = w.x;
          }

          if (w.y > s.y) {
            s.y = w.y;
          }

          if (w.x < r.x) {
            r.x = w.x;
          }

          if (w.y < r.y) {
            r.y = w.y;
          }
        });
        g = {
          topleft: r || new _Point(-1, -1),
          bottomright: s || new _Point(1, 1)
        };
      },
      systemEnergy: function systemEnergy(q) {
        return b;
      }
    };
    return i.init();
  };

  var _nearParticle = function _nearParticle(b, c) {
    var c = c || 0;
    var a = b.x;
    var f = b.y;
    var e = c * 2;
    return new _Point(a - c + Math.random() * e, f - c + Math.random() * e);
  }; // if called as a worker thread, set up a run loop for the Physics object and bail out


  if (typeof window == 'undefined') return function () {
    /* hermetic.js */
    $ = {
      each: function each(d, e) {
        if ($.isArray(d)) {
          for (var c = 0, b = d.length; c < b; c++) {
            e(c, d[c]);
          }
        } else {
          for (var a in d) {
            e(a, d[a]);
          }
        }
      },
      map: function map(a, c) {
        var b = [];
        $.each(a, function (f, e) {
          var d = c(e);

          if (d !== undefined) {
            b.push(d);
          }
        });
        return b;
      },
      extend: function extend(c, b) {
        if (_typeof(b) != "object") {
          return c;
        }

        for (var a in b) {
          if (b.hasOwnProperty(a)) {
            c[a] = b[a];
          }
        }

        return c;
      },
      isArray: function isArray(a) {
        if (!a) {
          return false;
        }

        return a.constructor.toString().indexOf("Array") != -1;
      },
      inArray: function inArray(c, a) {
        for (var d = 0, b = a.length; d < b; d++) {
          if (a[d] === c) {
            return d;
          }
        }

        return -1;
      },
      isEmptyObject: function isEmptyObject(a) {
        if (_typeof(a) !== "object") {
          return false;
        }

        var b = true;
        $.each(a, function (c, d) {
          b = false;
        });
        return b;
      }
    };
    /*     worker.js */

    var PhysicsWorker = function PhysicsWorker() {
      var b = 20;
      var a = null;
      var d = null;
      var c = null;
      var g = [];
      var f = new Date().valueOf();
      var e = {
        init: function init(h) {
          e.timeout(h.timeout);
          a = Physics(h.dt, h.stiffness, h.repulsion, h.friction, e.tock);
          return e;
        },
        timeout: function timeout(h) {
          if (h != b) {
            b = h;

            if (d !== null) {
              e.stop();
              e.go();
            }
          }
        },
        go: function go() {
          if (d !== null) {
            return;
          }

          c = null;
          d = setInterval(e.tick, b);
        },
        stop: function stop() {
          if (d === null) {
            return;
          }

          clearInterval(d);
          d = null;
        },
        tick: function tick() {
          a.tick();
          var h = a.systemEnergy();

          if ((h.mean + h.max) / 2 < 0.05) {
            if (c === null) {
              c = new Date().valueOf();
            }

            if (new Date().valueOf() - c > 1000) {
              e.stop();
            } else {}
          } else {
            c = null;
          }
        },
        tock: function tock(h) {
          h.type = "geometry";
          postMessage(h);
        },
        modifyNode: function modifyNode(i, h) {
          a.modifyNode(i, h);
          e.go();
        },
        modifyPhysics: function modifyPhysics(h) {
          a.modifyPhysics(h);
        },
        update: function update(h) {
          var i = a._update(h);
        }
      };
      return e;
    };

    var physics = PhysicsWorker();

    onmessage = function onmessage(a) {
      if (!a.data.type) {
        postMessage("¿kérnèl?");
        return;
      }

      if (a.data.type == "physics") {
        var b = a.data.physics;
        physics.init(a.data.physics);
        return;
      }

      switch (a.data.type) {
        case "modify":
          physics.modifyNode(a.data.id, a.data.mods);
          break;

        case "changes":
          physics.update(a.data.changes);
          physics.go();
          break;

        case "start":
          physics.go();
          break;

        case "stop":
          physics.stop();
          break;

        case "sys":
          var b = a.data.param || {};

          if (!isNaN(b.timeout)) {
            physics.timeout(b.timeout);
          }

          physics.modifyPhysics(b);
          physics.go();
          break;
      }
    };
  }();
  arbor = typeof arbor !== 'undefined' ? arbor : {};
  $.extend(arbor, {
    // object constructors (don't use ‘new’, just call them)
    ParticleSystem: ParticleSystem,
    Point: function Point(x, y) {
      return new _Point(x, y);
    },
    // immutable object with useful methods
    etc: {
      trace: trace,
      // ƒ(msg) -> safe console logging
      dirname: dirname,
      // ƒ(path) -> leading part of path
      basename: basename,
      // ƒ(path) -> trailing part of path
      ordinalize: ordinalize,
      // ƒ(num) -> abbrev integers (and add commas)
      objcopy: objcopy,
      // ƒ(old) -> clone an object
      objcmp: objcmp,
      // ƒ(a, b, strict_ordering) -> t/f comparison
      objkeys: objkeys,
      // ƒ(obj) -> array of all keys in obj
      objmerge: objmerge,
      // ƒ(dst, src) -> like $.extend but non-destructive
      uniq: uniq,
      // ƒ(arr) -> array of unique items in arr
      arbor_path: arbor_path // ƒ() -> guess the directory of the lib code

    }
  });
})(this.jQuery);
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49702" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","lib/arbor.js"], null)
//# sourceMappingURL=/arbor.207be8c9.js.map