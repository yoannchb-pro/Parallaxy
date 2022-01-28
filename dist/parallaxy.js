"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

/**
 * Parallaxy.js
 * Create beautiful parallax with attributes or in javascript
 * v1.0.0
 * https://github.com/yoannchb-pro/Parallaxy
 */
//For each for IE
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
  HTMLCollection.prototype.forEach = Array.prototype.forEach;
} //ALL PARALLAXY ATTRIBUTES


var ParallaxyAttributes = ["parallaxy-y", "parallaxy-x", "parallaxy-scale", "parallaxy-speed-x", "parallaxy-speed-y", "parallaxy-overflow-x", "parallaxy-overflow-y", "parallaxy-inverted-x", "parallaxy-inverted-y"]; //DEFAULT CONFIG

var ParallaxyDefaultconfig = {
  speed: 0.5,
  scale: 1.5
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
    this.start();
  }

  _createClass(Parallaxy, [{
    key: "verfiyConfiguration",
    value: function verfiyConfiguration(config) {
      if (!config.element) throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";
      if (!config.x && !config.y) config.y = {
        speed: ParallaxyDefaultconfig.speed
      };
      if (config.x && !config.x.speed) config.x.speed = {
        speed: ParallaxyDefaultconfig.speed
      };
      if (config.y && !config.y.speed) config.y.speed = {
        speed: ParallaxyDefaultconfig.speed
      };
      if (config.scale < 1) throw "[Parallaxy] 'scale' need to be bigger than 1 (or equal but with overflow)";
      if (!config.scale) config.scale = ParallaxyDefaultconfig.scale;
      return config;
    }
  }, {
    key: "start",
    value: function start() {
      document.addEventListener("scroll", this.updatePosition.bind(this));
      var obj = this;
      this.$el.forEach(function (el) {
        el.addEventListener('load', obj.updatePosition.bind(obj));
      });
      this.updatePosition();
    }
  }, {
    key: "stop",
    value: function stop() {
      document.removeEventListener("scroll", this.updatePosition.bind(this));
    }
  }, {
    key: "removeElement",
    value: function removeElement(el) {
      this.$el.splice(this.$el.indexOf(el), 1);

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
        el.transform = "";
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
    key: "updatePosition",
    value: function updatePosition() {
      var obj = this;
      this.$el.forEach(function (el) {
        var valid = obj.verifyParallaxy.bind(obj, el)();

        if (valid) {
          var transform = [];
          transform.push(obj.scale());
          if (obj.config.y) transform.push(obj.translateY(el));
          if (obj.config.x) transform.push(obj.translateX(el));
          el.style.transform = transform.join(' ');
        }

        ;
      });
    }
  }, {
    key: "originalRect",
    value: function originalRect(el) {
      var rec = el.getBoundingClientRect();
      var scale = this.config.scale;
      var width = rec.width / scale;
      var height = rec.height / scale;
      var additionalHeight = rec.height - height;
      var additionalWidth = rec.width - width;
      return {
        width: width,
        height: height,
        additionalHeight: additionalHeight,
        additionalWidth: additionalWidth
      };
    }
  }, {
    key: "scaledRect",
    value: function scaledRect(el) {
      var rec = el.getBoundingClientRect();
      return rec;
    }
  }, {
    key: "scale",
    value: function scale() {
      return "scale(".concat(this.config.scale, ")");
    }
  }, {
    key: "translateY",
    value: function translateY(el) {
      var speed = this.config.y.speed;
      var isInverted = this.config.y.inverted;
      var scaledRect = this.scaledRect(el);
      var originalRect = this.originalRect(el);
      var scaleSize = originalRect.additionalHeight / 2;
      var elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      var screenMiddleSize = window.innerHeight / 2;
      var elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      var translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      var newPosition = scaleSize / this.config.scale;

      if (!this.config.y.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return "translateY(".concat(translation, "px)");
    }
  }, {
    key: "translateX",
    value: function translateX(el) {
      var speed = this.config.x.speed;
      var isInverted = this.config.x.inverted;
      var scaledRect = this.scaledRect(el);
      var originalRect = this.originalRect(el);
      var scaleSize = originalRect.additionalWidth / 2;
      var elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      var screenMiddleSize = window.innerHeight / 2;
      var elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      var translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      var newPosition = scaleSize / this.config.scale;

      if (!this.config.x.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return "translateX(".concat(translation, "px)");
    }
  }]);

  return Parallaxy;
}(); //HANDLER ATTRIBUTE


function ParallaxyAttributesHandler(elements) {
  elements.forEach(function (el) {
    if (!el.getAttribute) return;
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
      }

      var scale = el.getAttribute('parallaxy-scale');
      if (scale) config.scale = parseFloat(scale);
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
    mutations.forEach(function (mutation) {
      var addedNodes = Array.prototype.slice.call(mutation.addedNodes);
      var removedNodes = Array.prototype.slice.call(mutation.removedNodes);
      var attr = mutation.attributeName;

      if (attr && attr.indexOf('parallaxy') != -1) {
        var el = mutation.target;

        if (el.getAttribute('parallaxy-x') != null || el.getAttribute('parallaxy-y') != null) {
          addedNodes.push(el);
        } else {
          removedNodes.push(el);
        }
      }

      if (addedNodes && addedNodes.length > 0) ParallaxyAttributesHandler(addedNodes);
    });
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
});