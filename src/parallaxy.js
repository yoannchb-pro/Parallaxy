"use strict";

//All actual parrallaxy elements
const ParallaxyElements = [];

//Default config
const ParallaxyDefaultconfig = {
  speed: 0.5,
  scale: 1.5,
};

//Parallaxy handler
class Parallaxy {
  constructor(config) {
    config = this.verfiyConfiguration(config);

    this.config = config;

    this.$el = this.config.element[0]
      ? this.config.element
      : [this.config.element];

    for (const el of this.$el) {
      el.style.willChange = "transform";
    }

    this.mainEvent = null;

    this.start();
  }

  verfiyConfiguration(config) {
    this.windowHeight = window.innerHeight;

    if (!config.element)
      throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";

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
    if (!config.scale) config.scale = ParallaxyDefaultconfig.scale;

    if (!config.axes) config.axes = this.windowHeight / 2;

    return config;
  }

  start() {
    this.mainEvent = this.updatePosition.bind(this);

    for (const el of this.$el) {
      el.addEventListener("load", () => {
        this.updatePosition();
      });
    }

    document.addEventListener("scroll", this.mainEvent);

    this.updatePosition();
  }

  stop() {
    document.removeEventListener("scroll", this.mainEvent);
  }

  removeElement(el) {
    this.$el.splice(this.$el.indexOf(el), 1);
    ParallaxyElements.splice(ParallaxyElements.indexOf(el), 1);

    if (this.$el.length == 0) {
      this.stop();
    }
  }

  adddElement(el) {
    this.$el.push(el);
    ParallaxyElements.push(el);

    this.stop();
    this.start();
  }

  reset() {
    for (const el of this.$el) {
      el.style.transform = "";
    }
  }

  verifyParallaxy(el) {
    const gC = el.dataset;
    if (gC.prlX == null && gC.prlY == null) {
      this.removeElement(el);
      return false;
    }
    return true;
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

    let topCondition =
      pos.top >= -additionalHeight && pos.top <= height + additionalHeight;
    let bottomCondition =
      pos.bottom >= -additionalHeight &&
      pos.bottom <= height + additionalHeight;

    if (topCondition || bottomCondition || (pos.top < 0 && pos.bottom > height))
      vIntersect = true;

    if (vIntersect) return true;

    return false;
  }

  updatePosition() {
    const breaking = this.matchingBreakingPoint();

    if (!breaking)
      for (const el of this.$el) {
        if (!el.isConnected) {
          this.removeElement(el);
          continue;
        }

        const rec = el.getBoundingClientRect();

        const valid = this.verifyParallaxy(el);
        const intersecting = this.isIntersectingObserver(rec);

        if (valid && intersecting) {
          const transform = [];

          transform.push(this.scale());

          let translation = { x: 0, y: 0 };

          if (this.config.y) {
            const transY = this.translateY(rec);
            translation.y = transY;
            transform.push(`translateY(${transY}px)`);
          }

          if (this.config.x) {
            const transX = this.translateX(rec);
            translation.x = transX;
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
      additionalWidth,
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
}

//Attributes handler
function ParallaxyAttributesHandler() {
  let elementsParallaxy = document.querySelectorAll(
    "[data-prl-y], [data-prl-x]"
  );

  for (const el of elementsParallaxy) {
    if (ParallaxyElements.indexOf(el) != -1 || !el.getAttribute) {
      return;
    }

    ParallaxyElements.push(el);

    const gC = el.dataset; //global config

    const x = gC.prlX != null;
    const y = gC.prlY != null;

    if (x || y) {
      const config = {
        element: el,
      };

      if (x) {
        const confX = {};

        //speed x
        const speed = gC.prlSpeedX;
        confX.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed;

        //invert x
        const invert = gC.prlInvertedX != null;
        confX.inverted = invert;

        //overflow x
        const overflow = gC.prlOverflowX != null;
        confX.overflow = overflow;

        config.x = confX;
      }

      if (y) {
        const confY = {};

        //speed y
        const speed = gC.prlSpeedY;
        confY.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed;

        //invert y
        const invert = gC.prlInvertedY != null;
        confY.inverted = invert;

        //overflow y
        const overflow = gC.prlOverflowY != null;
        confY.overflow = overflow;

        config.y = confY;
      }

      //scale
      const scale = gC.prlScale;
      if (scale != null) config.scale = parseFloat(scale);

      //break point
      const breakPoint = gC.prlBreakpoint;
      if (breakPoint != null) config.breakPoint = breakPoint;

      //axes
      const axes = gC.prlAxes;
      if (axes != null) config.axes = parseFloat(axes);

      new Parallaxy(config);
    }
  }
}

//Observer
function ParallaxyObserver() {
  function getMutationObserver() {
    return (
      window.MutationObserver ||
      window.WebKitMutationObserver ||
      window.MozMutationObserver
    );
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
    removedNodes: true,
  });
}

//Dom loaded
document.addEventListener("DOMContentLoaded", function () {
  ParallaxyObserver();

  ParallaxyAttributesHandler(
    document.querySelectorAll("[data-prl-y], [data-prl-x]")
  );
});

export default Parallaxy;
