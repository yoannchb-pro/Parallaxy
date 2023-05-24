import { ParallaxyElements } from "core/parallaxy";

/**
 * Parse boolean from attribute
 * @param str
 * @returns
 */
function parseBooleanAttribute(str: string): boolean {
  return str !== null && str !== undefined && (str === "" || str === "true");
}

/**
 * Parse float from attribute
 * @param str
 * @returns
 */
function parseFloatAttributes(str: string): number {
  const nb = parseFloat(str);
  return isNaN(nb) || typeof nb !== "number" ? undefined : nb;
}

/**
 * Find a parallaxy element by the index
 * @param element
 * @returns
 */
function findParallaxyElementIndex(element: HTMLElement | Node) {
  return ParallaxyElements.findIndex((e) => e.element === element);
}

export {
  parseBooleanAttribute,
  parseFloatAttributes,
  findParallaxyElementIndex,
};
