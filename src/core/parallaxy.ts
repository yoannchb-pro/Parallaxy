import Config from "../types/config";
import Rect from "types/rect";

const ParallaxyElements: { element: HTMLElement; instance: Parallaxy }[] = [];

const ParallaxyDefaultconfig = {
  speed: 0.3,
  scale: 1.5,
} as const;

class Parallaxy {
  private frameId: number;
  private actualTranslation = { x: 0, y: 0 };
  private actualScale = 1;

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
  updateConfig(config: Config = {}) {
    this.config = this.verfiyConfiguration(config);
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
      const transY = this.translateY(scaledRect);
      translation.y = parseFloat(transY.toFixed(2));
    }
    if (this.config.x) {
      const transX = this.translateX(scaledRect);
      translation.x = parseFloat(transX.toFixed(2));
    }

    transform.push(`translate3d(${translation.x}px, ${translation.y}px, 0px)`);

    if (
      this.actualScale !== this.config.scale ||
      this.actualTranslation.x !== translation.x ||
      this.actualTranslation.y !== translation.y
    ) {
      this.element.style.transform = transform.join(" ");

      this.actualScale = this.config.scale;
      this.actualTranslation.x = translation.x;
      this.actualTranslation.y = translation.y;
    }

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
