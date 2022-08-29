(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Parallaxy = factory());
})(this, (function () { 'use strict';

  const ParallaxyElements = []; //DEFAULT CONFIG

  const ParallaxyDefaultconfig = {
    speed: 0.5,
    scale: 1.5,
    adaptative: 1
  }; //PARALLAXY MAIN CLASS

  class Parallaxy {
    constructor(config) {
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

    verfiyConfiguration(config) {
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
        const nb = parseInt(config.adaptative);

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

    start() {
      this.mainEvent = this.updatePosition.bind(this);
      const obj = this;
      this.$el.forEach(function (el) {
        el.addEventListener("load", function () {
          obj.updatePosition.bind(obj)();
        });
      });
      if (this.config.adaptative) this.adaptativeImageHandler();
      document.addEventListener("scroll", this.mainEvent, {
        passive: true
      });
      this.updatePosition();
    }

    stop() {
      document.removeEventListener("scroll", this.mainEvent, {
        passive: true
      });
      this.instances.forEach(function (e) {
        document.removeEventListener("resize", e.fn, {
          passive: true
        });
        e.obs.unobserve(e.parent);
      });
    }

    removeElement(el) {
      this.$el.splice(this.$el.indexOf(el), 1);
      ParallaxyElements.splice(ParallaxyElements.indexOf(el), 1);
      const filtered = this.instances.filter(function (e) {
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

    adddElement(el) {
      this.$el.push(el);
      this.stop();
      this.start();
    }

    reset() {
      this.$el.forEach(function (el) {
        el.style.transform = "";
      });
    }

    adaptativeImageHandler() {
      const config = this.config.adaptative;
      const type = config.type;
      const value = config.value;
      const obj = this;

      function getParent(element) {
        let parent = element; //SETING UP PARENT OF ELEMENT

        if (type == "query") {
          parent = document.querySelector(value);
        } else {
          for (let i = 0; i < value; ++i) {
            parent = parent.parentNode;
          }
        }

        return parent;
      }

      function adaptation({
        parent,
        element
      }) {
        function setWidth() {
          element.style.width = "100%";
          element.style.height = "auto";
        }

        function setHeight() {
          element.style.height = "100%";
          element.style.width = "auto";
        }

        const imageAspectRatio = element.clientWidth / element.clientHeight,
              parentAspectRatio = parent.clientWidth / parent.clientHeight;
        if (imageAspectRatio > parentAspectRatio) setHeight();else setWidth();
      }

      this.$el.forEach(function (element) {
        const parent = getParent(element);
        const fn = adaptation.bind(this, {
          parent: parent,
          element: element
        });

        const ResizeObserverObj = window.ResizeObserver || function (callback) {
          let backSize = {
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

          let inter = null;
          return {
            observe: function (lookAt) {
              inter = setInterval(loop.bind(null, lookAt, callback), 1000 / 30); //30 fps
            },
            unobserve: function () {
              clearInterval(inter);
            }
          };
        };

        const obsResize = new ResizeObserverObj(fn);
        obsResize.observe(parent);
        document.addEventListener("resize", fn, {
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

    verifyParallaxy(el) {
      const gC = el.dataset;

      if (gC.prlX == null && gC.prlY == null) {
        this.removeElement(el);
        return false;
      }

      return true;
    }

    isIntersectingObserver(element, rec, translation = {
      x: 0,
      y: 0
    }) {
      const height = this.windowHeight;
      const additionalHeight = height / 2; //Because rec is only in read mode

      const pos = {
        top: rec.top,
        bottom: rec.bottom
      };
      pos.top = pos.top + translation.y;
      pos.bottom = pos.bottom + translation.y;
      let vIntersect = false;
      let topCondition = pos.top >= -additionalHeight && pos.top <= height + additionalHeight;
      let bottomCondition = pos.bottom >= -additionalHeight && pos.bottom <= height + additionalHeight;
      if (topCondition || bottomCondition || pos.top < 0 && pos.bottom > height) vIntersect = true;
      if (vIntersect) return true;
      return false;
    }

    matchingBreakingPoint() {
      const breakingPoint = this.config.breakPoint;
      if (!breakingPoint) return false;

      if (window.matchMedia(breakingPoint).matches) {
        this.reset();
        return true;
      }

      return false;
    }

    updatePosition() {
      const breaking = this.matchingBreakingPoint();
      const obj = this;
      if (!breaking) for (const el of this.$el) {
        if (!el.isConnected) {
          obj.removeElement(el);
          continue;
        }

        const rec = el.getBoundingClientRect();
        const valid = obj.verifyParallaxy.bind(obj, el)();
        const intersecting = obj.isIntersectingObserver(el, rec);

        if (valid && intersecting) {
          const transform = [];
          transform.push(obj.scale());

          if (obj.config.y) {
            const transY = obj.translateY(rec);
            transform.push(`translateY(${transY}px)`);
          }

          if (obj.config.x) {
            const transX = obj.translateX(rec);
            transform.push(`translateX(${transX}px)`);
          }

          el.style.transform = transform.join(" ");
        }
      }
    }

    originalRect(rec) {
      const scale = this.config.scale;
      const top = rec.top;
      const left = rec.left;
      const right = rec.right;
      const bottom = rec.bottom;
      const width = rec.width / scale;
      const height = rec.height / scale;
      const additionalHeight = rec.height - height;
      const additionalWidth = rec.width - width;
      return {
        width,
        height,
        top,
        left,
        right,
        bottom,
        additionalHeight,
        additionalWidth
      };
    }

    scale() {
      return `scale(${this.config.scale})`;
    }

    translateY(rec) {
      const speed = this.config.y.speed;
      const isInverted = this.config.y.inverted;
      const scaledRect = rec;
      const originalRect = this.originalRect(rec);
      const scaleSize = originalRect.additionalHeight / 2;
      const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      const screenMiddleSize = this.config.axes;
      const elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      let translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      const newPosition = scaleSize / this.config.scale;

      if (!this.config.y.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return translation;
    }

    translateX(rec) {
      const speed = this.config.x.speed;
      const isInverted = this.config.x.inverted;
      const scaledRect = rec;
      const originalRect = this.originalRect(rec);
      const scaleSize = originalRect.additionalWidth / 2;
      const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
      const screenMiddleSize = this.config.axes;
      const elementPositionFromTop = screenMiddleSize - elementCenterPosition;
      let translation = elementPositionFromTop * speed;
      if (isInverted) translation = -translation; //*(speed/4)

      const newPosition = scaleSize / this.config.scale;

      if (!this.config.x.overflow && Math.abs(translation) >= newPosition) {
        translation = translation < 0 ? -newPosition : newPosition;
      }

      return translation;
    }

  } //HANDLER ATTRIBUTE


  function ParallaxyAttributesHandler() {
    let elementsParallaxy = document.querySelectorAll("[data-prl-y], [data-prl-x]");
    elementsParallaxy.forEach(function (el) {
      if (ParallaxyElements.indexOf(el) != -1 || !el.getAttribute) {
        return;
      }

      ParallaxyElements.push(el);
      const gC = el.dataset; //global config

      const x = gC.prlX != null;
      const y = gC.prlY != null;

      if (x || y) {
        const config = {
          element: el
        };

        if (x) {
          const confX = {}; //speed x

          const speed = gC.prlSpeedX;
          confX.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed; //invert x

          const invert = gC.prlInvertedX != null;
          confX.inverted = invert; //overflow x

          const overflow = gC.prlOverflowX != null;
          confX.overflow = overflow;
          config.x = confX;
        }

        if (y) {
          const confY = {}; //speed y

          const speed = gC.prlSpeedY;
          confY.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed; //invert y

          const invert = gC.prlInvertedY != null;
          confY.inverted = invert; //overflow y

          const overflow = gC.prlOverflowY != null;
          confY.overflow = overflow;
          config.y = confY;
        } //scale


        const scale = gC.prlScale;
        if (scale != null) config.scale = parseFloat(scale); //break point

        const breakPoint = gC.prlBreakpoint;
        if (breakPoint != null) config.breakPoint = breakPoint; //axes

        const axes = gC.prlAxes;
        if (axes != null) config.axes = parseFloat(axes); //adaptative

        const adaptative = gC.prlAdaptative;
        if (adaptative != null) config.adaptative = adaptative.trim() == "" ? ParallaxyDefaultconfig.adaptative : adaptative;
        new Parallaxy(config);
      }
    });
  } //OBSERVER


  function ParallaxyObserver() {
    function getMutationObserver() {
      return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    }

    const MutationObserver = getMutationObserver();
    const observerDOM = new MutationObserver(function (mutations) {
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


  document.addEventListener("DOMContentLoaded", function () {
    ParallaxyObserver();
    ParallaxyAttributesHandler(document.querySelectorAll("[data-prl-y], [data-prl-x]"));
  }); //EXPORT

  return Parallaxy;

}));
//# sourceMappingURL=parallaxy.js.map
