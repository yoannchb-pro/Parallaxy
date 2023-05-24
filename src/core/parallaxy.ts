import EventListener from "types/eventListener";
import Config from "../types/config";
import Rect from "types/rect";
// import { isIntersecting, observe, unobserve } from "./intersect";

const ParallaxyElements: { element: HTMLElement; instance: Parallaxy }[] = [];

const ParallaxyDefaultconfig = {
  speed: 0.2,
  scale: 1.5,
} as const;

class Parallaxy {
  private mainEvent: EventListener<Event>;
  private frameId: number;

  constructor(private element: HTMLElement, private config: Config) {
    if (!element)
      throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";

    config = this.verfiyConfiguration(config);

    element.style.willChange = "transform";

    ParallaxyElements.push({ element, instance: this });

    this.start();
  }

  private verfiyConfiguration(config: Config) {
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

    if (!config.axes) config.axes = window.innerHeight / 2;

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

    // if (this.config.y) observe(this.element);
    // this.mainEvent = () => {
    //   if (this.frameId) window.cancelAnimationFrame(this.frameId);
    //   this.frameId = window.requestAnimationFrame(
    //     this.updatePosition.bind(this)
    //   );
    // };
    //if it's an image, video ...
    // this.element.addEventListener("load", this.updatePosition.bind(this), {
    //   once: true,
    // });
    // document.addEventListener("scroll", this.mainEvent);

    this.updatePosition();
  }

  stop() {
    // if (this.config.y) unobserve(this.element);
    document.removeEventListener("scroll", this.mainEvent);
    this.reset();
  }

  reset() {
    this.element.style.transform = "";
  }

  private updatePosition() {
    if (!this.element.isConnected) {
      this.stop();
      return;
    }

    // if (this.config.y && !isIntersecting(this.element)) return;

    const scaledRect = this.element.getBoundingClientRect();

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

    window.requestAnimationFrame(this.updatePosition.bind(this));
  }

  private scale() {
    return `scale(${this.config.scale})`;
  }

  private translateY(scaledRect: Rect) {
    const speed = this.config.y.speed;
    const isInverted = this.config.y.inverted;

    const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
    const elementPositionFromTop = this.config.axes - elementCenterPosition;

    let translation = elementPositionFromTop * speed;
    if (isInverted) translation = -translation;

    const additionalheight =
      (scaledRect.height - scaledRect.height / this.config.scale) / 2;
    if (!this.config.y.overflow && Math.abs(translation) >= additionalheight) {
      translation = translation < 0 ? -additionalheight : additionalheight;
    }

    return translation;
  }

  private translateX(scaledRect: Rect) {
    const speed = this.config.x.speed;
    const isInverted = this.config.x.inverted;

    const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
    const elementPositionFromTop = this.config.axes - elementCenterPosition;

    let translation = elementPositionFromTop * speed;
    if (isInverted) translation = -translation;

    const additionalWidth =
      (scaledRect.width - scaledRect.width / this.config.scale) / 2;
    if (!this.config.x.overflow && Math.abs(translation) >= additionalWidth) {
      translation = translation < 0 ? -additionalWidth : additionalWidth;
    }

    return translation;
  }
}

export { Parallaxy, ParallaxyElements, ParallaxyDefaultconfig };
