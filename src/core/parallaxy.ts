import EventListener from "types/eventListener";
import Config from "../types/config";
import Rect from "types/rect";

const ParallaxyElements: { element: HTMLElement; instance: Parallaxy }[] = [];

const ParallaxyDefaultconfig = {
  speed: 0.5,
  scale: 1.5,
} as const;

class Parallaxy {
  private mainEvent: EventListener<Event>;
  private windowHeight: number;

  constructor(private element: HTMLElement, private config: Config) {
    if (!element)
      throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";

    config = this.verfiyConfiguration(config);

    // element.style.willChange = "transform";

    ParallaxyElements.push({ element, instance: this });

    this.start();
  }

  private verfiyConfiguration(config: Config) {
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
    if (!config.scale) config.scale = ParallaxyDefaultconfig.scale;

    if (!config.axes) config.axes = this.windowHeight / 2;

    return config;
  }

  //TODO
  updateConfig() {}

  private matchingBreakingPoint() {
    const breakingPoint = this.config.breakPoint;

    if (breakingPoint && window.matchMedia(breakingPoint).matches) {
      this.stop();
      return true;
    }

    return false;
  }

  start() {
    if (this.matchingBreakingPoint()) return;

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

  private isIntersectingObserver(rec: any, marge: number = 50) {
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

  private updatePosition() {
    if (!this.element.isConnected) {
      this.stop();
      return;
    }

    const scaledRect = this.element.getBoundingClientRect();

    const isIntersecting = this.isIntersectingObserver(scaledRect);
    if (!isIntersecting) return;

    const transform = [];

    transform.push(this.scale());

    let translation = { x: 0, y: 0 };

    if (this.config.y) {
      translation.y = this.translateY(scaledRect);
    }

    if (this.config.x) {
      translation.x = this.translateX(scaledRect);
    }

    transform.push(`translate3d(${translation.x}px, ${translation.y}px, 0px)`);

    this.element.style.transform = transform.join(" ");
  }

  private originalRect(scaledRect: Rect) {
    const scale = this.config.scale;

    const width = scaledRect.width / scale;
    const height = scaledRect.height / scale;

    const additionalHeight = scaledRect.height - height;
    const additionalWidth = scaledRect.width - width;

    return {
      ...scaledRect,
      width,
      height,
      additionalHeight,
      additionalWidth,
    };
  }

  private scale() {
    return `scale(${this.config.scale})`;
  }

  private translateY(scaledRect: Rect) {
    const speed = this.config.y.speed;
    const isInverted = this.config.y.inverted;

    const originalRect = this.originalRect(scaledRect);

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

  private translateX(scaledRect: Rect) {
    const speed = this.config.x.speed;
    const isInverted = this.config.x.inverted;

    const originalRect = this.originalRect(scaledRect);

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

export { Parallaxy, ParallaxyElements, ParallaxyDefaultconfig };
