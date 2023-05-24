const observedElements: { element: HTMLElement; isIntersecting: boolean }[] =
  [];

const options: IntersectionObserverInit = {
  root: null,
  rootMargin: "0px",
};

/**
 * Find element into the array
 * @param element
 * @returns
 */
function findElementIndex(element: HTMLElement | Element) {
  return observedElements.findIndex((e) => e.element === element);
}

const observer = new IntersectionObserver(function handleIntersection(entries) {
  for (const entry of entries) {
    if (!entry.target.isConnected) unobserve(entry.target);
    const index = findElementIndex(entry.target);
    if (index === -1) unobserve(entry.target);
    observedElements[index].isIntersecting = entry.isIntersecting;
  }
}, options);

/**
 * Observe if an element is intersecting
 * @param element
 */
function observe(element: HTMLElement) {
  observedElements.push({ element, isIntersecting: false });
  observer.observe(element);
}

/**
 * Unobserve element
 * @param element
 */
function unobserve(element: HTMLElement | Element) {
  const index = findElementIndex(element);
  if (index === -1) return;
  observedElements.splice(index, 1);
  observer.unobserve(element);
}

function isIntersecting(element: HTMLElement) {
  const index = findElementIndex(element);
  if (index === -1) return false;
  return observedElements[index].isIntersecting;
}

export { observe, unobserve, isIntersecting };
