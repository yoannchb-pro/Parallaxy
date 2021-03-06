'use strict'; //all actual parrallaxy elements

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var ParallaxyElements = []; //For each for IE

if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = Array.prototype.forEach;
} //ALL PARALLAXY ATTRIBUTES


var ParallaxyAttributes = ["parallaxy-y", "parallaxy-x", "parallaxy-scale", "parallaxy-axes", "parallaxy-adaptative", "parallaxy-breakpoint", "parallaxy-speed-x", "parallaxy-speed-y", "parallaxy-overflow-x", "parallaxy-overflow-y", "parallaxy-inverted-x", "parallaxy-inverted-y"]; //DEFAULT CONFIG

var ParallaxyDefaultconfig = {
  speed: 0.5,
  scale: 1.5,
  adaptative: 1
}; //PARALLAXY MAIN CLASS

var Parallaxy = /*#__PURE__*/function () {
  function Parallaxy(config) {
    _classCallCheck(this, Parallaxy);

    config = this.verfiyConfiguration(config);
    this.config = config;
    this.$el = this.config.element[0] ? this.config.element : [this.config.element];
    this.$el.forEach(function (el) {
      el.style.willChange = "transform";
    });
    this.instances = [];
    this.mainEvent = null;
    this.start();
  }

  _createClass(Parallaxy, [{
    key: "verfiyConfiguration",
    value: function verfiyConfiguration(config) {
      this.windowHeight = window.innerHeight;
      if (!config.element) throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";
      if (!config.x && !config.y) config.y = {
        speed: ParallaxyDefaultconfig.speed
      };
      if (config.x && !config.x.speed) config.x.speed = ParallaxyDefaultconfig.speed;
      if (config.y && !config.y.speed) config.y.speed = ParallaxyDefaultconfig.speed;
      if (config.x && config.x.speed <= 0) throw "[Parallaxy] 'speed' need to be bigger than 0";
      if (config.y && config.y.speed <= 0) throw "[Parallaxy] 'speed' need to be bigger than 0";
      if (config.x && config.x.speed > 0.65) throw "[Parallaxy] 'speed' need to be smaller than 0.65";
      if (config.y && config.y.speed > 0.65) throw "[Parallaxy] 'speed' need to be smaller than 0.65";
      if (config.scale < 1) throw "[Parallaxy] 'scale' need to be bigger than 1 (or equal but with overflow)";
      if (!config.scale) config.scale = ParallaxyDefaultconfig.scale;
      if (!config.axes) config.axes = this.windowHeight / 2;

      if (config.adaptative) {
        var nb = parseInt(config.adaptative);

        if (nb) {
          if (nb <= 0) throw "[Parallaxy] parallaxy adaptative number must be > 0";
          config.adaptative = {
            type: "number",
            value: nb
          };
        } else {
          config.adaptative = {
            type: "query",
            value: config.adaptative
          };
        }
      }

      return config;
    }
  }, {
    key: "start",
    value: function start() {
      this.mainEvent = this.updatePosition.bind(this);
      var obj = this;
      this.$el.forEach(function (el) {
        el.addEventListener('load', function () {
          obj.updatePosition.bind(obj)();
        });
      });
      if (this.config.adaptative) this.adaptativeImageHandler();
      document.addEventListener("scroll", this.mainEvent, {
        passive: true
      });
      this.updatePosition();
    }
  }, {
    key: "stop",
    value: function stop() {
      document.removeEventListener("scroll", this.mainEvent, {
        passive: true
      });
      this.instances.forEach(function (e) {
        document.removeEventListener('resize', e.fn, {
          passive: true
        });
        e.obs.unobserve(e.parent);
      });
    }
  }, {
    key: "removeElement",
    value: function removeElement(el) {
      this.$el.splice(this.$el.indexOf(el), 1);
      ParallaxyElements.splice(ParallaxyElements.indexOf(el), 1);
      var filtered = this.instances.filter(function (e) {
        e.element == el;
      });

      if (filtered && filtered.length > 0) {
        filtered.forEach(function (e) {
          document.removeEventListener("resize", e.fn, {
            passive: true
          });
          e.obs.unobserve(e.parent);
        });
      }

      if (this.$el.length == 0) {
        this.stop();
      }
    }
  }, {
    key: "adddElement",
    value: function adddElement(el) {
      this.$el.push(el);
      this.stop();
      this.start();
    }
  }, {
    key: "reset",
    value: function reset() {
      this.$el.forEach(function (el) {
        el.style.transform = "";
      });
    }
  }, {
    key: "adaptativeImageHandler",
    value: function adaptativeImageHandler() {
      var config = this.config.adaptative;
      var type = config.type;
      var value = config.value;
      var obj = this;

      function getParent(element) {
        var parent = element; //SETING UP PARENT OF ELEMENT

        if (type == "query") {
          parent = document.querySelector(value);
        } else {
          for (var i = 0; i < value; ++i) {
            parent = parent.parentNode;
          }
        }

        return parent;
      }

      function adaptation(_ref) {
        var parent = _ref.parent,
            element = _ref.element;

        function setWidth() {
          element.style.width = "100%";
          element.style.height = "auto";
        }

        function setHeight() {
          element.style.height = "100%";
          element.style.width = "auto";
        }

        var imageAspectRatio = element.clientWidth / element.clientHeight,
            parentAspectRatio = parent.clientWidth / parent.clientHeight;
        if (imageAspectRatio > parentAspectRatio) setHeight();else setWidth();
      }

      this.$el.forEach(function (element) {
        var parent = getParent(element);
        var fn = adaptation.bind(this, {
          parent: parent,
          element: element
        });

        var ResizeObserverObj = window.ResizeObserver || function (callback) {
          var backSize = {
            width: 0,
            height: 0
          };

          function loop(p, c) {
            if (p.clientWidth != backSize.width || p.clientHeight != backSize.height) {
              c();
            }

            backSize.width = p.clientWidth;
            backSize.height = p.clientHeight;
          }

          var inter = null;
          return {
            observe: function observe(lookAt) {
              inter = setInterval(loop.bind(null, lookAt, callback), 1000 / 30); //30 fps
            },
            unobserve: function unobserve() {
              clearInterval(inter);
            }
          };
        };

        var obsResize = new ResizeObserverObj(fn);
        obsResize.observe(parent);
        document.addEventListener('resize', fn, {
          passive: true
        });
        obj.instances.push({
          element: element,
          parent: parent,
          fn: fn,
          obs: obsResize
        }); //INITIALISING SIZE

        fn();
      });
    }
  }, {
    key: "verifyParallaxy",
    value: function verifyParallaxy(el) {
      if (el.getAttribute('parallaxy-x') == null && el.getAttribute('parallaxy-y') == null) {
        this.removeElement(el);
        return false;
      }

      return true;
    }
  }, {
    key: "isIntersectingObserver",
    value: function isIntersectingObserver(element, rec) {
      var translation = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
        x: 0,
        y: 0
      };
      var height = this.windowHeight;
      var additionalHeight = height / 2; //Because rec is only in read mode

      var pos = {
        top: rec.top,
        bottom: rec.bottom
      };
      pos.top = pos.top + translation.y;
      pos.bottom = pos.bottom + translation.y;
      var vIntersect = false;
      var topCondition = pos.top >= -additionalHeight && pos.top <= height + additionalHeight;
      var bottomCondition = pos.bottom >= -additionalHeight && pos.bottom <= height + additionalHeight;
      if (topCondition || bottomCondition || pos.top < 0 && pos.bottom > height) vIntersect = true;
      if (vIntersect) return true;
      return false;
    }
  }, {
    key: "matchingBreakingPoint",
    value: function matchingBreakingPoint() {
      var breakingPoint = this.config.breakPoint;
      if (!breakingPoint) return false;

      if (window.matchMedia(breakingPoint).matches) {
        this.reset();
        return true;
      }

      return false;
    }
  }, {
    key: "updatePosition",
    value: function updatePosition() {
      var breaking = this.matchingBreakingPoint();
      var obj = this;

      if (!breaking) {
        var _iterator = _createForOfIteratorHelper(this.$el),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var el = _step.value;

            if (!el.isConnected) {
              obj.removeElement(el);
              continue;
            }

            var rec = el.getBoundingClientRect();
            var valid = obj.verifyParallaxy.bind(obj, el)();
            var intersecting = obj.isIntersectingObserver(el, rec);

            if (valid && intersecting) {
              var transform = [];
              transform.push(obj.scale());
              var translation = {
                x: 0,
                y: 0
              };

              if (obj.config.y) {
                var transY = obj.translateY(rec);
                translation.y = transY;
                transform.push("translateY(".concat(transY, "px)"));
              }

              if (obj.config.x) {
                var transX = obj.translateX(rec);
                translation.x = transX;
                transform.push("translateX(".concat(transX, "px)"));
              }

              el.style.transform = transform.join(' ');
            }

            ;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      ;
    }
  }, {
    key: "originalRect",
    value: function originalRect(rec) {
      var scale = this.config.scale;
      var top = rec.top;
      var left = rec.left;
      var right = rec.right;
      var bottom = rec.bottom;
      var width = rec.width / scale;
      var height = rec.height / scale;
      var additionalHeight = rec.height - height;
      var additionalWidth = rec.width - width;
      return {
        width: width,
        height: height,
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        additionalHeight: additionalHeight,
        additionalWidth: additionalWidth
      };
    }
  }, {
    key: "scale",
    value: function scale() {
      return "scale(".concat(this.config.scale, ")");
    }
  }, {
    key: "translateY",
    value: function translateY(rec) {
      var speed = this.config.y.speed;
      var isInverted = this.config.y.inverted;
      var scaledRect = rec;
      var originalRect = this.originalRect(rec);
      var scaleSize = originalRect.additionalHeight / 2;
      var elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      var screenMiddleSize = this.config.axes;
      var elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      var translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      var newPosition = scaleSize / this.config.scale;

      if (!this.config.y.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return translation;
    }
  }, {
    key: "translateX",
    value: function translateX(rec) {
      var speed = this.config.x.speed;
      var isInverted = this.config.x.inverted;
      var scaledRect = rec;
      var originalRect = this.originalRect(rec);
      var scaleSize = originalRect.additionalWidth / 2;
      var elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      var screenMiddleSize = this.config.axes;
      var elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      var translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      var newPosition = scaleSize / this.config.scale;

      if (!this.config.x.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return translation;
    }
  }]);

  return Parallaxy;
}(); //HANDLER ATTRIBUTE


function ParallaxyAttributesHandler() {
  var elementsParallaxy = document.querySelectorAll('[parallaxy-y], [parallaxy-x]');
  elementsParallaxy.forEach(function (el) {
    if (ParallaxyElements.indexOf(el) != -1 || !el.getAttribute) {
      return;
    }

    ParallaxyElements.push(el);
    var x = el.getAttribute("parallaxy-x") != null;
    var y = el.getAttribute("parallaxy-y") != null;

    if (x || y) {
      var config = {
        element: el
      };

      if (x) {
        var confX = {}; //speed x

        var speed = el.getAttribute("parallaxy-speed-x");
        confX.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed; //invert x

        var invert = el.getAttribute("parallaxy-inverted-x") != null;
        confX.inverted = invert; //overflow x

        var overflow = el.getAttribute("parallaxy-overflow-x") != null;
        confX.overflow = overflow;
        config.x = confX;
      }

      if (y) {
        var confY = {}; //speed y

        var _speed = el.getAttribute("parallaxy-speed-y");

        confY.speed = parseFloat(_speed) || ParallaxyDefaultconfig.speed; //invert y

        var _invert = el.getAttribute("parallaxy-inverted-y") != null;

        confY.inverted = _invert; //overflow y

        var _overflow = el.getAttribute("parallaxy-overflow-y") != null;

        confY.overflow = _overflow;
        config.y = confY;
      } //scale


      var scale = el.getAttribute('parallaxy-scale');
      if (scale != null) config.scale = parseFloat(scale); //break point

      var breakPoint = el.getAttribute('parallaxy-breakpoint');
      if (breakPoint != null) config.breakPoint = breakPoint; //axes

      var axes = el.getAttribute('parallaxy-axes');
      if (axes != null) config.axes = parseFloat(axes); //adaptative

      var adaptative = el.getAttribute('parallaxy-adaptative');
      if (adaptative != null) config.adaptative = adaptative.trim() == "" ? ParallaxyDefaultconfig.adaptative : adaptative;
      new Parallaxy(config);
    }
  });
} //OBSERVER


function ParallaxyObserver() {
  function getMutationObserver() {
    return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  }

  var MutationObserver = getMutationObserver();
  var observerDOM = new MutationObserver(function (mutations) {
    if (!mutations) return;
    ParallaxyAttributesHandler();
  });
  observerDOM.observe(window.document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    removedNodes: true
  });
} //DOM LOADED


document.addEventListener('DOMContentLoaded', function () {
  ParallaxyObserver();
  ParallaxyAttributesHandler(document.querySelectorAll('[parallaxy-y], [parallaxy-x]'));
}); //EXPORT

if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) == "object") module.exports = {
  ParallaxyAttributes: ParallaxyAttributes,
  Parallaxy: Parallaxy,
  ParallaxyDefaultconfig: ParallaxyDefaultconfig
};