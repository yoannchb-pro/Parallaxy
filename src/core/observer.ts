import { findParallaxyElementIndex, parseBooleanAttribute } from "../utils";
import {
  ParallaxyAttributesHandler,
  getConfigFromAttributes,
} from "./attr-handler";
import { ParallaxyElements } from "./parallaxy";

function ParallaxyObserver() {
  const observerDOM = new MutationObserver(function (mutations) {
    const addedNodes: HTMLElement[] = [];

    for (const mutation of mutations ?? []) {
      //attributes changed
      if (
        mutation.type === "attributes" &&
        mutation.attributeName.includes("data-prl")
      ) {
        const element = mutation.target as HTMLElement;
        const cardIndex = findParallaxyElementIndex(element);

        const isParallaxy =
          parseBooleanAttribute(element.dataset?.prlX) ||
          parseBooleanAttribute(element.dataset?.prlY);

        if (isParallaxy && cardIndex === -1) {
          addedNodes.push(element);
        } else if (cardIndex !== -1) {
          ParallaxyElements[cardIndex].instance.updateConfig(
            getConfigFromAttributes(ParallaxyElements[cardIndex].element)
          );
        }
      }

      //added nodes
      for (const addedNode of mutation.addedNodes) {
        addedNodes.push(addedNode as HTMLElement);
      }

      //removed nodes
      for (const removedNode of mutation.removedNodes) {
        const elementIndex = findParallaxyElementIndex(removedNode);
        if (elementIndex !== -1) {
          ParallaxyElements.splice(elementIndex, 1);
        }
      }
    }

    if (addedNodes.length > 0) ParallaxyAttributesHandler(addedNodes);
  });

  observerDOM.observe(window.document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

export default ParallaxyObserver;
