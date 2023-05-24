import {
  findParallaxyElementIndex,
  parseBooleanAttribute,
  parseFloatAttributes,
} from "utils";
import { Parallaxy, ParallaxyDefaultconfig } from "./parallaxy";
import Config from "types/config";

function getConfigFromAttributes(element: HTMLElement): Config {
  const attr = element.dataset; //global config

  const isOnX = attr.prlX !== undefined;
  const isOnY = attr.prlY !== undefined;

  const config: Config = {};

  if (isOnX) {
    config.x = {
      speed:
        parseFloatAttributes(attr.prlSpeedX) ?? ParallaxyDefaultconfig.speed,
      inverted: parseBooleanAttribute(attr.prlInvertedX),
      overflow: parseBooleanAttribute(attr.prlOverflowX),
    };
  }

  if (isOnY) {
    config.y = {
      speed:
        parseFloatAttributes(attr.prlSpeedY) ?? ParallaxyDefaultconfig.speed,
      inverted: parseBooleanAttribute(attr.prlInvertedY),
      overflow: parseBooleanAttribute(attr.prlOverflowY),
    };
  }

  config.scale = parseFloatAttributes(attr.prlScale);

  const breakPoint = attr.prlBreakpoint;
  if (breakPoint !== undefined) config.breakPoint = breakPoint;

  const axes = attr.prlAxes;
  if (axes !== undefined) config.axes = parseFloatAttributes(axes);

  return config;
}

function ParallaxyAttributesHandler(elementsParallaxy: HTMLElement[]) {
  for (const element of elementsParallaxy) {
    const alreadySetup = findParallaxyElementIndex(element) !== -1;
    const isNotParallaxy =
      element.dataset?.prlX === undefined &&
      element.dataset?.prlY === undefined;

    if (alreadySetup || isNotParallaxy) continue;

    new Parallaxy(element, getConfigFromAttributes(element));
  }
}

export { ParallaxyAttributesHandler, getConfigFromAttributes };
