import { StagehandContainer } from "./StagehandContainer.js";
import { GlobalPageContainer } from "./GlobalPageContainer.js";
import { ElementContainer } from "./ElementContainer.js";

/**
 * Decide which container to create.
 */
export function createStagehandContainer(
  obj: Window | HTMLElement,
): StagehandContainer {
  if (obj instanceof Window) {
    return new GlobalPageContainer();
  } else {
    return new ElementContainer(obj);
  }
}
