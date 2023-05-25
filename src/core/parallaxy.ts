import Config from "../types/config";
import Rect from "types/rect";
import { getConfigFromAttributes } from "./attr-handler";

const ParallaxyElements: { element: HTMLElement; instance: Parallaxy }[] = [];

const ParallaxyDefaultconfig = {
  speed: 0.3,
  scale: 1.5,
} as const;

class Parallaxy {
  private frameId: number;

  constructor(private element: HTMLElement, private config: Config = {}) {
    if (!element)
      throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";

    config = this.verfiyConfiguration(config);

    element.style.willChange = "transform";

    ParallaxyElements.push({ element, instance: this });

    this.start();
  }

  /**
   * Check the configuration and set the default config
   * @param config
   * @returns
   */
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
    if (config.x && config.x.speed > 1)
      throw "[Parallaxy] 'speed' need to be smaller than 1";
    if (config.y && config.y.speed > 1)
      throw "[Parallaxy] 'speed' need to be smaller than 1";

    if (config.scale < 1)
      throw "[Parallaxy] 'scale' need to be bigger than 1 (or equal but with overflow)";
    if (!config.scale) config.scale = ParallaxyDefaultconfig.scale;

    return config;
  }

  /**
   * Update the config on attribute change
   * @param config
   */
  updateConfig(config?: Config) {
    const newConfig = this.verfiyConfiguration(
      config ?? getConfigFromAttributes(this.element)
    );
    this.config = newConfig;
    this.stop();
    this.start();
  }

  /**
   * Check if the breaking point is matched
   * @returns
   */
  private matchingBreakingPoint() {
    const breakingPoint = this.config.breakPoint;

    if (breakingPoint && window.matchMedia(breakingPoint).matches) {
      this.stop();
      return true;
    }

    return false;
  }

  /**
   * Start the parallax
   * @returns
   */
  start() {
    if (this.matchingBreakingPoint()) return;
    this.updatePosition();
  }

  /**
   * Stop the parallax
   */
  stop() {
    window.cancelAnimationFrame(this.frameId);
    this.reset();
  }

  /**
   * Reset the transformation on the parallax
   */
  reset() {
    this.element.style.transform = "";
  }

  /**
   * Update the position of the image for the parallax effect
   * @returns
   */
  private updatePosition() {
    if (!this.element.isConnected) {
      this.stop();
      return;
    }

    const scaledRect = this.element.getBoundingClientRect();

    const transform = [];
    transform.push(`scale(${this.config.scale})`);

    let translation = { x: 0, y: 0 };
    if (this.config.y) {
      translation.y = this.translateY(scaledRect);
    }
    if (this.config.x) {
      translation.x = this.translateX(scaledRect);
    }

    transform.push(`translate3d(${translation.x}px, ${translation.y}px, 0px)`);

    this.element.style.transform = transform.join(" ");
    this.frameId = window.requestAnimationFrame(this.updatePosition.bind(this));
  }

  /**
   * Return the y translation in px
   * @param scaledRect
   * @returns
   */
  private translateY(scaledRect: Rect) {
    const speed = this.config.y.speed;
    const isInverted = this.config.y.inverted;

    const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
    const elementPositionFromTop =
      (this.config.axes ?? window.innerHeight / 2) - elementCenterPosition;

    let translation = elementPositionFromTop * speed;
    if (isInverted) translation = -translation;

    //handle overflow
    const additionalHeight =
      (scaledRect.height - scaledRect.height / this.config.scale) / 2;
    if (!this.config.y.overflow && Math.abs(translation) >= additionalHeight) {
      translation = translation < 0 ? -additionalHeight : additionalHeight;
    }

    return translation;
  }

  /**
   * Return the x translation in px
   * @param scaledRect
   * @returns
   */
  private translateX(scaledRect: Rect) {
    const speed = this.config.x.speed;
    const isInverted = this.config.x.inverted;

    const elementCenterPosition = scaledRect.top + scaledRect.height / 2;
    const elementPositionFromTop =
      (this.config.axes ?? window.innerHeight / 2) - elementCenterPosition;

    let translation = elementPositionFromTop * speed;
    if (isInverted) translation = -translation;

    //handle overflow
    const additionalWidth =
      (scaledRect.width - scaledRect.width / this.config.scale) / 2;
    if (!this.config.x.overflow && Math.abs(translation) >= additionalWidth) {
      translation = translation < 0 ? -additionalWidth : additionalWidth;
    }

    return translation;
  }
}

export { Parallaxy, ParallaxyElements, ParallaxyDefaultconfig };
