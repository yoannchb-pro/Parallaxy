(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Parallaxy = factory());
})(this, (function () { 'use strict';

  const ParallaxyElements = [];
  const ParallaxyDefaultconfig = {
      speed: 0.5,
      scale: 1.5,
  };
  class Parallaxy {
      constructor(element, config) {
          this.element = element;
          this.config = config;
          if (!element)
              throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";
          config = this.verfiyConfiguration(config);
          element.style.willChange = "transform";
          ParallaxyElements.push({ element, instance: this });
          this.start();
      }
      verfiyConfiguration(config) {
          this.windowHeight = window.innerHeight;
          if (!config.x && !config.y)
              config.y = { speed: ParallaxyDefaultconfig.speed };
          if (config.x && !config.x.speed)
              config.x.speed = ParallaxyDefaultconfig.speed;
          if (config.y && !config.y.speed)
              config.y.speed = ParallaxyDefaultconfig.speed;
          if (config.x && config.x.speed <= 0)
              throw "[Parallaxy] 'speed' need to be bigger than 0";
          if (config.y && config.y.speed <= 0)
              throw "[Parallaxy] 'speed' need to be bigger than 0";
          if (config.x && config.x.speed > 0.65)
              throw "[Parallaxy] 'speed' need to be smaller than 0.65";
          if (config.y && config.y.speed > 0.65)
              throw "[Parallaxy] 'speed' need to be smaller than 0.65";
          if (config.scale < 1)
              throw "[Parallaxy] 'scale' need to be bigger than 1 (or equal but with overflow)";
          if (!config.scale)
              config.scale = ParallaxyDefaultconfig.scale;
          if (!config.axes)
              config.axes = this.windowHeight / 2;
          return config;
      }
      updateConfig() { }
      matchingBreakingPoint() {
          const breakingPoint = this.config.breakPoint;
          if (breakingPoint && window.matchMedia(breakingPoint).matches) {
              this.stop();
              return true;
          }
          return false;
      }
      start() {
          if (this.matchingBreakingPoint())
              return;
          this.mainEvent = this.updatePosition.bind(this);
          this.element.addEventListener("load", this.updatePosition.bind(this), {
              once: true,
          });
          document.addEventListener("scroll", this.mainEvent);
          this.updatePosition();
      }
      stop() {
          document.removeEventListener("scroll", this.mainEvent);
          this.reset();
      }
      reset() {
          this.element.style.transform = "";
      }
      isIntersectingObserver(rec, marge = 50) {
          const height = this.windowHeight;
          const additionalHeight = height / 2;
          //Because rec is only in read mode
          const pos = {
              top: rec.top,
              bottom: rec.bottom,
          };
          pos.top = pos.top - marge;
          pos.bottom = pos.bottom + marge;
          let vIntersect = false;
          let topCondition = pos.top >= -additionalHeight && pos.top <= height + additionalHeight;
          let bottomCondition = pos.bottom >= -additionalHeight &&
              pos.bottom <= height + additionalHeight;
          if (topCondition || bottomCondition || (pos.top < 0 && pos.bottom > height))
              vIntersect = true;
          if (vIntersect)
              return true;
          return false;
      }
      updatePosition() {
          if (!this.element.isConnected) {
              this.stop();
              return;
          }
          const scaledRect = this.element.getBoundingClientRect();
          const isIntersecting = this.isIntersectingObserver(scaledRect);
          if (!isIntersecting)
              return;
          const transform = [];
          transform.push(this.scale());
          if (this.config.y) {
              transform.push(`translateY(${this.translateY(scaledRect)}px)`);
          }
          if (this.config.x) {
              transform.push(`translateX(${this.translateX(scaledRect)}px)`);
          }
          this.element.style.transform = transform.join(" ");
      }
      originalRect(scaledRect) {
          const scale = this.config.scale;
          const width = scaledRect.width / scale;
          const height = scaledRect.height / scale;
          const additionalHeight = scaledRect.height - height;
          const additionalWidth = scaledRect.width - width;
          return Object.assign(Object.assign({}, scaledRect), { width,
              height,
              additionalHeight,
              additionalWidth });
      }
      scale() {
          return `scale(${this.config.scale})`;
      }
      translateY(scaledRect) {
          const speed = this.config.y.speed;
          const isInverted = this.config.y.inverted;
          const originalRect = this.originalRect(scaledRect);
          const scaleSize = originalRect.additionalHeight / 2;
          const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
          const screenMiddleSize = this.config.axes;
          const elementPositionFromTop = screenMiddleSize - elementCenterPosition;
          let translation = elementPositionFromTop * speed;
          if (isInverted)
              translation = -translation; //*(speed/4)
          const newPosition = scaleSize / this.config.scale;
          if (!this.config.y.overflow && Math.abs(translation) >= newPosition) {
              translation = translation < 0 ? -newPosition : newPosition;
          }
          return translation;
      }
      translateX(scaledRect) {
          const speed = this.config.x.speed;
          const isInverted = this.config.x.inverted;
          const originalRect = this.originalRect(scaledRect);
          const scaleSize = originalRect.additionalWidth / 2;
          const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
          const screenMiddleSize = this.config.axes;
          const elementPositionFromTop = screenMiddleSize - elementCenterPosition;
          let translation = elementPositionFromTop * speed;
          if (isInverted)
              translation = -translation; //*(speed/4)
          const newPosition = scaleSize / this.config.scale;
          if (!this.config.x.overflow && Math.abs(translation) >= newPosition) {
              translation = translation < 0 ? -newPosition : newPosition;
          }
          return translation;
      }
  }

  /**
   * Parse boolean from attribute
   * @param str
   * @returns
   */
  function parseBooleanAttribute(str) {
      return str !== null && str !== undefined && (str === "" || str === "true");
  }
  /**
   * Parse float from attribute
   * @param str
   * @returns
   */
  function parseFloatAttributes(str) {
      const nb = parseFloat(str);
      return isNaN(nb) || typeof nb !== "number" ? undefined : nb;
  }
  /**
   * Find a parallaxy element by the index
   * @param element
   * @returns
   */
  function findParallaxyElementIndex(element) {
      return ParallaxyElements.findIndex((e) => e.element === element);
  }

  function getConfigFromAttributes(element) {
      var _a, _b;
      const attr = element.dataset; //global config
      const isOnX = attr.prlX !== undefined;
      const isOnY = attr.prlY !== undefined;
      const config = {};
      if (isOnX) {
          config.x = {
              speed: (_a = parseFloatAttributes(attr.prlSpeedX)) !== null && _a !== void 0 ? _a : ParallaxyDefaultconfig.speed,
              inverted: parseBooleanAttribute(attr.prlInvertedX),
              overflow: parseBooleanAttribute(attr.prlOverflowX),
          };
      }
      if (isOnY) {
          config.y = {
              speed: (_b = parseFloatAttributes(attr.prlSpeedY)) !== null && _b !== void 0 ? _b : ParallaxyDefaultconfig.speed,
              inverted: parseBooleanAttribute(attr.prlInvertedY),
              overflow: parseBooleanAttribute(attr.prlOverflowY),
          };
      }
      config.scale = parseFloatAttributes(attr.prlScale);
      const breakPoint = attr.prlBreakpoint;
      if (breakPoint !== undefined)
          config.breakPoint = breakPoint;
      const axes = attr.prlAxes;
      if (axes !== undefined)
          config.axes = parseFloatAttributes(axes);
      return config;
  }
  function ParallaxyAttributesHandler(elementsParallaxy) {
      var _a, _b;
      for (const element of elementsParallaxy) {
          const alreadySetup = findParallaxyElementIndex(element) !== -1;
          const isNotParallaxy = ((_a = element.dataset) === null || _a === void 0 ? void 0 : _a.prlX) === undefined &&
              ((_b = element.dataset) === null || _b === void 0 ? void 0 : _b.prlY) === undefined;
          if (alreadySetup || isNotParallaxy)
              continue;
          new Parallaxy(element, getConfigFromAttributes(element));
      }
  }

  //Observer
  function ParallaxyObserver() {
      const observerDOM = new MutationObserver(function (mutations) {
          var _a, _b;
          const addedNodes = [];
          for (const mutation of mutations !== null && mutations !== void 0 ? mutations : []) {
              //attributes changed
              if (mutation.type === "attributes" &&
                  mutation.attributeName.includes("data-prl")) {
                  const element = mutation.target;
                  const cardIndex = findParallaxyElementIndex(element);
                  const isParallaxy = parseBooleanAttribute((_a = element.dataset) === null || _a === void 0 ? void 0 : _a.prlX) ||
                      parseBooleanAttribute((_b = element.dataset) === null || _b === void 0 ? void 0 : _b.prlY);
                  if (isParallaxy && cardIndex === -1) {
                      addedNodes.push(element);
                  }
                  else if (cardIndex !== -1) {
                      ParallaxyElements[cardIndex].instance.updateConfig();
                  }
              }
              //added nodes
              for (const addedNode of mutation.addedNodes) {
                  addedNodes.push(addedNode);
              }
              //removed nodes
              for (const removedNode of mutation.removedNodes) {
                  const elementIndex = findParallaxyElementIndex(removedNode);
                  if (elementIndex !== -1) {
                      ParallaxyElements.splice(elementIndex, 1);
                  }
              }
          }
          if (addedNodes.length > 0)
              ParallaxyAttributesHandler(addedNodes);
      });
      observerDOM.observe(window.document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
      ParallaxyAttributesHandler(Array.from(document.querySelectorAll("[data-prl-y], [data-prl-x]")));
      ParallaxyObserver();
  });

  return Parallaxy;

}));
//# sourceMappingURL=parallaxy.js.map
