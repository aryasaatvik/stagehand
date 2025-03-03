export const scriptContent = "(() => {\n  // lib/dom/elementCheckUtils.ts\n  function isElementNode(node) {\n    return node.nodeType === Node.ELEMENT_NODE;\n  }\n  function isTextNode(node) {\n    return node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim());\n  }\n  var leafElementDenyList = [\"SVG\", \"IFRAME\", \"SCRIPT\", \"STYLE\", \"LINK\"];\n  var interactiveElementTypes = [\n    \"A\",\n    \"BUTTON\",\n    \"DETAILS\",\n    \"EMBED\",\n    \"INPUT\",\n    \"LABEL\",\n    \"MENU\",\n    \"MENUITEM\",\n    \"OBJECT\",\n    \"SELECT\",\n    \"TEXTAREA\",\n    \"SUMMARY\"\n  ];\n  var interactiveRoles = [\n    \"button\",\n    \"menu\",\n    \"menuitem\",\n    \"link\",\n    \"checkbox\",\n    \"radio\",\n    \"slider\",\n    \"tab\",\n    \"tabpanel\",\n    \"textbox\",\n    \"combobox\",\n    \"grid\",\n    \"listbox\",\n    \"option\",\n    \"progressbar\",\n    \"scrollbar\",\n    \"searchbox\",\n    \"switch\",\n    \"tree\",\n    \"treeitem\",\n    \"spinbutton\",\n    \"tooltip\"\n  ];\n  var interactiveAriaRoles = [\"menu\", \"menuitem\", \"button\"];\n  var isVisible = (element) => {\n    const rect = element.getBoundingClientRect();\n    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) {\n      return false;\n    }\n    if (!isTopElement(element, rect)) {\n      return false;\n    }\n    const visible = element.checkVisibility({\n      checkOpacity: true,\n      checkVisibilityCSS: true\n    });\n    return visible;\n  };\n  var isTextVisible = (element) => {\n    const range = document.createRange();\n    range.selectNodeContents(element);\n    const rect = range.getBoundingClientRect();\n    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) {\n      return false;\n    }\n    const parent = element.parentElement;\n    if (!parent) {\n      return false;\n    }\n    const visible = parent.checkVisibility({\n      checkOpacity: true,\n      checkVisibilityCSS: true\n    });\n    return visible;\n  };\n  function isTopElement(elem, rect) {\n    const points = [\n      { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.25 },\n      { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.25 },\n      { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.75 },\n      { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.75 },\n      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }\n    ];\n    return points.some((point) => {\n      const topEl = document.elementFromPoint(point.x, point.y);\n      let current = topEl;\n      while (current && current !== document.body) {\n        if (current.isSameNode(elem)) {\n          return true;\n        }\n        current = current.parentElement;\n      }\n      return false;\n    });\n  }\n  var isActive = (element) => {\n    if (element.hasAttribute(\"disabled\") || element.hasAttribute(\"hidden\") || element.getAttribute(\"aria-disabled\") === \"true\") {\n      return false;\n    }\n    return true;\n  };\n  var isInteractiveElement = (element) => {\n    const elementType = element.tagName;\n    const elementRole = element.getAttribute(\"role\");\n    const elementAriaRole = element.getAttribute(\"aria-role\");\n    return elementType && interactiveElementTypes.includes(elementType) || elementRole && interactiveRoles.includes(elementRole) || elementAriaRole && interactiveAriaRoles.includes(elementAriaRole);\n  };\n  var isLeafElement = (element) => {\n    if (element.textContent === \"\") {\n      return false;\n    }\n    if (element.childNodes.length === 0) {\n      return !leafElementDenyList.includes(element.tagName);\n    }\n    if (element.childNodes.length === 1 && isTextNode(element.childNodes[0])) {\n      return true;\n    }\n    return false;\n  };\n\n  // lib/dom/xpathUtils.ts\n  function getParentElement(node) {\n    return isElementNode(node) ? node.parentElement : node.parentNode;\n  }\n  function getCombinations(attributes, size) {\n    const results = [];\n    function helper(start, combo) {\n      if (combo.length === size) {\n        results.push([...combo]);\n        return;\n      }\n      for (let i = start; i < attributes.length; i++) {\n        combo.push(attributes[i]);\n        helper(i + 1, combo);\n        combo.pop();\n      }\n    }\n    helper(0, []);\n    return results;\n  }\n  function isXPathFirstResultElement(xpath, target) {\n    try {\n      const result = document.evaluate(\n        xpath,\n        document.documentElement,\n        null,\n        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,\n        null\n      );\n      return result.snapshotItem(0) === target;\n    } catch (error) {\n      console.warn(`Invalid XPath expression: ${xpath}`, error);\n      return false;\n    }\n  }\n  function escapeXPathString(value) {\n    if (value.includes(\"'\")) {\n      if (value.includes('\"')) {\n        return \"concat(\" + value.split(/('+)/).map((part) => {\n          if (part === \"'\") {\n            return `\"'\"`;\n          } else if (part.startsWith(\"'\") && part.endsWith(\"'\")) {\n            return `\"${part}\"`;\n          } else {\n            return `'${part}'`;\n          }\n        }).join(\",\") + \")\";\n      } else {\n        return `\"${value}\"`;\n      }\n    } else {\n      return `'${value}'`;\n    }\n  }\n  async function generateXPathsForElement(element) {\n    if (!element) return [];\n    const [complexXPath, standardXPath, idBasedXPath] = await Promise.all([\n      generateComplexXPath(element),\n      generateStandardXPath(element),\n      generatedIdBasedXPath(element)\n    ]);\n    return [standardXPath, ...idBasedXPath ? [idBasedXPath] : [], complexXPath];\n  }\n  async function generateComplexXPath(element) {\n    const parts = [];\n    let currentElement = element;\n    while (currentElement && (isTextNode(currentElement) || isElementNode(currentElement))) {\n      if (isElementNode(currentElement)) {\n        const el = currentElement;\n        let selector = el.tagName.toLowerCase();\n        const attributePriority = [\n          \"data-qa\",\n          \"data-component\",\n          \"data-role\",\n          \"role\",\n          \"aria-role\",\n          \"type\",\n          \"name\",\n          \"aria-label\",\n          \"placeholder\",\n          \"title\",\n          \"alt\"\n        ];\n        const attributes = attributePriority.map((attr) => {\n          let value = el.getAttribute(attr);\n          if (attr === \"href-full\" && value) {\n            value = el.getAttribute(\"href\");\n          }\n          return value ? { attr: attr === \"href-full\" ? \"href\" : attr, value } : null;\n        }).filter((attr) => attr !== null);\n        let uniqueSelector = \"\";\n        for (let i = 1; i <= attributes.length; i++) {\n          const combinations = getCombinations(attributes, i);\n          for (const combo of combinations) {\n            const conditions = combo.map((a) => `@${a.attr}=${escapeXPathString(a.value)}`).join(\" and \");\n            const xpath2 = `//${selector}[${conditions}]`;\n            if (isXPathFirstResultElement(xpath2, el)) {\n              uniqueSelector = xpath2;\n              break;\n            }\n          }\n          if (uniqueSelector) break;\n        }\n        if (uniqueSelector) {\n          parts.unshift(uniqueSelector.replace(\"//\", \"\"));\n          break;\n        } else {\n          const parent = getParentElement(el);\n          if (parent) {\n            const siblings = Array.from(parent.children).filter(\n              (sibling) => sibling.tagName === el.tagName\n            );\n            const index = siblings.indexOf(el) + 1;\n            selector += siblings.length > 1 ? `[${index}]` : \"\";\n          }\n          parts.unshift(selector);\n        }\n      }\n      currentElement = getParentElement(currentElement);\n    }\n    const xpath = \"//\" + parts.join(\"/\");\n    return xpath;\n  }\n  async function generateStandardXPath(element) {\n    const parts = [];\n    while (element && (isTextNode(element) || isElementNode(element))) {\n      let index = 0;\n      let hasSameTypeSiblings = false;\n      const siblings = element.parentElement ? Array.from(element.parentElement.childNodes) : [];\n      for (let i = 0; i < siblings.length; i++) {\n        const sibling = siblings[i];\n        if (sibling.nodeType === element.nodeType && sibling.nodeName === element.nodeName) {\n          index = index + 1;\n          hasSameTypeSiblings = true;\n          if (sibling.isSameNode(element)) {\n            break;\n          }\n        }\n      }\n      if (element.nodeName !== \"#text\") {\n        const tagName = element.nodeName.toLowerCase();\n        const pathIndex = hasSameTypeSiblings ? `[${index}]` : \"\";\n        parts.unshift(`${tagName}${pathIndex}`);\n      }\n      element = element.parentElement;\n    }\n    return parts.length ? `/${parts.join(\"/\")}` : \"\";\n  }\n  async function generatedIdBasedXPath(element) {\n    if (isElementNode(element) && element.id) {\n      return `//*[@id='${element.id}']`;\n    }\n    return null;\n  }\n\n  // lib/dom/utils.ts\n  async function waitForDomSettle() {\n    return new Promise((resolve) => {\n      const createTimeout = () => {\n        return setTimeout(() => {\n          resolve();\n        }, 2e3);\n      };\n      let timeout = createTimeout();\n      const observer = new MutationObserver(() => {\n        clearTimeout(timeout);\n        timeout = createTimeout();\n      });\n      observer.observe(window.document.body, { childList: true, subtree: true });\n    });\n  }\n  window.waitForDomSettle = waitForDomSettle;\n  function calculateViewportHeight() {\n    return Math.ceil(window.innerHeight * 0.75);\n  }\n  function canElementScroll(elem) {\n    if (typeof elem.scrollTo !== \"function\") {\n      console.warn(\"canElementScroll: .scrollTo is not a function.\");\n      return false;\n    }\n    try {\n      const originalTop = elem.scrollTop;\n      elem.scrollTo({\n        top: originalTop + 100,\n        left: 0,\n        behavior: \"instant\"\n      });\n      if (elem.scrollTop === originalTop) {\n        throw new Error(\"scrollTop did not change\");\n      }\n      elem.scrollTo({\n        top: originalTop,\n        left: 0,\n        behavior: \"instant\"\n      });\n      return true;\n    } catch (error) {\n      console.warn(\"canElementScroll error:\", error.message || error);\n      return false;\n    }\n  }\n  function getNodeFromXpath(xpath) {\n    return document.evaluate(\n      xpath,\n      document.documentElement,\n      null,\n      XPathResult.FIRST_ORDERED_NODE_TYPE,\n      null\n    ).singleNodeValue;\n  }\n\n  // lib/dom/candidateCollector.ts\n  var xpathCache = /* @__PURE__ */ new Map();\n  async function collectCandidateElements(candidateContainerRoot, indexOffset = 0) {\n    const DOMQueue = [...candidateContainerRoot.childNodes];\n    const candidateElements = [];\n    while (DOMQueue.length > 0) {\n      const node = DOMQueue.pop();\n      let shouldAdd = false;\n      if (node && isElementNode(node)) {\n        for (let i = node.childNodes.length - 1; i >= 0; i--) {\n          DOMQueue.push(node.childNodes[i]);\n        }\n        if (isInteractiveElement(node)) {\n          if (isActive(node) && isVisible(node)) {\n            shouldAdd = true;\n          }\n        }\n        if (isLeafElement(node)) {\n          if (isActive(node) && isVisible(node)) {\n            shouldAdd = true;\n          }\n        }\n      }\n      if (node && isTextNode(node) && isTextVisible(node)) {\n        shouldAdd = true;\n      }\n      if (shouldAdd) {\n        candidateElements.push(node);\n      }\n    }\n    const selectorMap = {};\n    let outputString = \"\";\n    const xpathLists = await Promise.all(\n      candidateElements.map((elem) => {\n        if (xpathCache.has(elem)) {\n          return Promise.resolve(xpathCache.get(elem));\n        }\n        return generateXPathsForElement(elem).then((xpaths) => {\n          xpathCache.set(elem, xpaths);\n          return xpaths;\n        });\n      })\n    );\n    candidateElements.forEach((elem, idx) => {\n      const xpaths = xpathLists[idx];\n      let elemOutput = \"\";\n      if (isTextNode(elem)) {\n        const textContent = elem.textContent?.trim();\n        if (textContent) {\n          elemOutput += `${idx + indexOffset}:${textContent}\n`;\n        }\n      } else if (isElementNode(elem)) {\n        const tagName = elem.tagName.toLowerCase();\n        const attributes = collectEssentialAttributes(elem);\n        const opening = `<${tagName}${attributes ? \" \" + attributes : \"\"}>`;\n        const closing = `</${tagName}>`;\n        const textContent = elem.textContent?.trim() || \"\";\n        elemOutput += `${idx + indexOffset}:${opening}${textContent}${closing}\n`;\n      }\n      outputString += elemOutput;\n      selectorMap[idx + indexOffset] = xpaths;\n    });\n    return { outputString, selectorMap };\n  }\n  function collectEssentialAttributes(element) {\n    const essentialAttributes = [\n      \"id\",\n      \"class\",\n      \"href\",\n      \"src\",\n      \"aria-label\",\n      \"aria-name\",\n      \"aria-role\",\n      \"aria-description\",\n      \"aria-expanded\",\n      \"aria-haspopup\",\n      \"type\",\n      \"value\"\n    ];\n    const attrs = essentialAttributes.map((attr) => {\n      const value = element.getAttribute(attr);\n      return value ? `${attr}=\"${value}\"` : \"\";\n    }).filter((attr) => attr !== \"\");\n    Array.from(element.attributes).forEach((attr) => {\n      if (attr.name.startsWith(\"data-\")) {\n        attrs.push(`${attr.name}=\"${attr.value}\"`);\n      }\n    });\n    return attrs.join(\" \");\n  }\n\n  // lib/dom/StagehandContainer.ts\n  var StagehandContainer = class {\n    /**\n     * Collects multiple \"DOM chunks\" by scrolling through the container\n     * in increments from `startOffset` to `endOffset`. At each scroll\n     * position, the function extracts a snapshot of \"candidate elements\"\n     * using `collectCandidateElements`.\n     *\n     * Each chunk represents a subset of the DOM at a particular\n     * vertical scroll offset, including:\n     *\n     * - `startOffset` & `endOffset`: The vertical scroll bounds for this chunk.\n     * - `outputString`: A serialized representation of extracted DOM text.\n     * - `selectorMap`: A mapping of temporary indices to the actual element(s)\n     *   that were collected in this chunk, useful for further processing.\n     *\n     * @param startOffset - The initial scroll offset from which to begin collecting.\n     * @param endOffset - The maximum scroll offset to collect up to.\n     * @param chunkSize - The vertical increment to move between each chunk.\n     * @param scrollTo - Whether we should scroll to the chunk\n     * @param scrollBackToTop - Whether to scroll the container back to the top once finished.\n     * @param candidateContainer - Optionally, a specific container element within\n     * the root for which to collect data. If omitted, uses `this.getRootElement()`.\n     *\n     * @returns A promise that resolves with an array of `DomChunk` objects.\n     *\n     * ### How It Works\n     *\n     * 1. **Scroll Range Calculation**:\n     *    - Computes `maxOffset` as the maximum offset that can be scrolled\n     *      (`scrollHeight - viewportHeight`).\n     *    - Restricts `endOffset` to not exceed `maxOffset`.\n     *\n     * 2. **Chunk Iteration**:\n     *    - Loops from `startOffset` to `endOffset` in steps of `chunkSize`.\n     *    - For each offset `current`, we call `this.scrollTo(current)`\n     *      to position the container.\n     *\n     * 3. **Element Collection**:\n     *    - Invokes `collectCandidateElements` on either `candidateContainer`\n     *      (if provided) or the result of `this.getRootElement()`.\n     *    - This returns both an `outputString` (serialized text)\n     *      and a `selectorMap` of found elements for that section of the DOM.\n     *\n     * 4. **Chunk Assembly**:\n     *    - Creates a `DomChunk` object for the current offset range,\n     *      storing `outputString`, `selectorMap`, and scroll offsets.\n     *    - Pushes it onto the `chunks` array.\n     *\n     * 5. **Scroll Reset**:\n     *    - Once iteration completes, if `scrollBackToTop` is `true`,\n     *      we scroll back to offset `0`.\n     */\n    async collectDomChunks(startOffset, endOffset, chunkSize, scrollTo = true, scrollBackToTop = true, candidateContainer) {\n      const chunks = [];\n      const maxOffset = this.getScrollHeight();\n      const finalEnd = Math.min(endOffset, maxOffset);\n      let index = 0;\n      for (let current = startOffset; current <= finalEnd; current += chunkSize) {\n        if (scrollTo) {\n          await this.scrollTo(current);\n        }\n        const rootCandidate = candidateContainer || this.getRootElement();\n        const { outputString, selectorMap } = await collectCandidateElements(\n          rootCandidate,\n          index\n        );\n        chunks.push({\n          startOffset: current,\n          endOffset: current + chunkSize,\n          outputString,\n          selectorMap\n        });\n        index += Object.keys(selectorMap).length;\n      }\n      if (scrollBackToTop) {\n        await this.scrollTo(0);\n      }\n      return chunks;\n    }\n  };\n\n  // lib/dom/GlobalPageContainer.ts\n  var GlobalPageContainer = class extends StagehandContainer {\n    getRootElement() {\n      return document.body;\n    }\n    /**\n     * Calculates the viewport height for the entire page, using a helper.\n     * The helper returns 75% of the window height, to ensure that we don't\n     * miss any content that may be behind sticky elements like nav bars.\n     *\n     * @returns The current height of the global viewport, in pixels.\n     */\n    getViewportHeight() {\n      return calculateViewportHeight();\n    }\n    getScrollHeight() {\n      return document.documentElement.scrollHeight;\n    }\n    getScrollPosition() {\n      return window.scrollY;\n    }\n    /**\n     * Smoothly scrolls the page to the specified vertical offset, and then\n     * waits until scrolling has stopped. There is a delay built in to allow\n     * for lazy loading and other asynchronous content to load.\n     *\n     * @param offset - The desired scroll offset from the top of the page.\n     * @returns A promise that resolves once scrolling is complete.\n     */\n    async scrollTo(offset) {\n      await new Promise((resolve) => setTimeout(resolve, 1500));\n      window.scrollTo({ top: offset, behavior: \"smooth\" });\n      await this.waitForScrollEnd();\n    }\n    /**\n     * Scrolls the page so that a given element is visible, or scrolls to the top\n     * if no element is specified. Uses smooth scrolling and waits for it to complete.\n     *\n     * @param element - The DOM element to bring into view. If omitted, scrolls to top.\n     * @returns A promise that resolves once scrolling is complete.\n     */\n    async scrollIntoView(element) {\n      if (!element) {\n        window.scrollTo({ top: 0, behavior: \"smooth\" });\n      } else {\n        const rect = element.getBoundingClientRect();\n        const currentY = window.scrollY || document.documentElement.scrollTop;\n        const elementY = currentY + rect.top - window.innerHeight * 0.25;\n        window.scrollTo({ top: elementY, behavior: \"smooth\" });\n      }\n      await this.waitForScrollEnd();\n    }\n    /**\n     * Internal helper that waits until the global scroll activity has stopped.\n     * It listens for scroll events, resetting a short timer every time a scroll\n     * occurs, and resolves once there's no scroll for ~100ms.\n     *\n     * @returns A promise that resolves when scrolling has finished.\n     */\n    async waitForScrollEnd() {\n      return new Promise((resolve) => {\n        let scrollEndTimer;\n        const handleScroll = () => {\n          clearTimeout(scrollEndTimer);\n          scrollEndTimer = window.setTimeout(() => {\n            window.removeEventListener(\"scroll\", handleScroll);\n            resolve();\n          }, 100);\n        };\n        window.addEventListener(\"scroll\", handleScroll, { passive: true });\n        handleScroll();\n      });\n    }\n  };\n\n  // lib/dom/ElementContainer.ts\n  var ElementContainer = class extends StagehandContainer {\n    /**\n     * Creates an instance of `ElementContainer` tied to a specific element.\n     * @param el - The scrollable `HTMLElement` that this container controls.\n     */\n    constructor(el) {\n      super();\n      this.el = el;\n    }\n    getRootElement() {\n      return this.el;\n    }\n    /**\n     * Retrieves the height of the visible viewport within this element\n     * (`el.clientHeight`).\n     *\n     * @returns The visible (client) height of the element, in pixels.\n     */\n    getViewportHeight() {\n      return this.el.clientHeight;\n    }\n    getScrollHeight() {\n      return this.el.scrollHeight;\n    }\n    /**\n     * Returns the element's current vertical scroll offset.\n     */\n    getScrollPosition() {\n      return this.el.scrollTop;\n    }\n    /**\n     * Smoothly scrolls this element to the specified vertical offset, and\n     * waits for the scrolling to complete.\n     *\n     * @param offset - The scroll offset (in pixels) from the top of the element.\n     * @returns A promise that resolves once scrolling is finished.\n     */\n    async scrollTo(offset) {\n      this.el.scrollTo({ top: offset, behavior: \"smooth\" });\n      await this.waitForScrollEnd();\n    }\n    /**\n     * Scrolls this element so that the given `element` is visible, or\n     * scrolls to the top if none is provided. Smoothly animates the scroll\n     * and waits until it finishes.\n     *\n     * @param element - The child element to bring into view. If omitted, scrolls to top.\n     * @returns A promise that resolves once scrolling completes.\n     */\n    async scrollIntoView(element) {\n      if (!element) {\n        this.el.scrollTo({ top: 0, behavior: \"smooth\" });\n      } else {\n        element.scrollIntoView({ behavior: \"smooth\", block: \"end\" });\n      }\n      await this.waitForScrollEnd();\n    }\n    /**\n     * Internal helper that waits until scrolling in this element has\n     * fully stopped. It listens for scroll events on the element,\n     * resetting a short timer every time a scroll occurs, and resolves\n     * once there's no scroll for ~100ms.\n     *\n     * @returns A promise that resolves when scrolling has finished.\n     */\n    async waitForScrollEnd() {\n      return new Promise((resolve) => {\n        let scrollEndTimer;\n        const handleScroll = () => {\n          clearTimeout(scrollEndTimer);\n          scrollEndTimer = window.setTimeout(() => {\n            this.el.removeEventListener(\"scroll\", handleScroll);\n            resolve();\n          }, 100);\n        };\n        this.el.addEventListener(\"scroll\", handleScroll, { passive: true });\n        handleScroll();\n      });\n    }\n  };\n\n  // lib/dom/containerFactory.ts\n  function createStagehandContainer(obj) {\n    if (obj instanceof Window) {\n      return new GlobalPageContainer();\n    } else {\n      return new ElementContainer(obj);\n    }\n  }\n\n  // lib/dom/process.ts\n  function getScrollableElements(topN) {\n    const docEl = document.documentElement;\n    const scrollableElements = [docEl];\n    const allElements = document.querySelectorAll(\"*\");\n    for (const elem of allElements) {\n      const style = window.getComputedStyle(elem);\n      const overflowY = style.overflowY;\n      const isPotentiallyScrollable = overflowY === \"auto\" || overflowY === \"scroll\" || overflowY === \"overlay\";\n      if (isPotentiallyScrollable) {\n        const candidateScrollDiff = elem.scrollHeight - elem.clientHeight;\n        if (candidateScrollDiff > 0 && canElementScroll(elem)) {\n          scrollableElements.push(elem);\n        }\n      }\n    }\n    scrollableElements.sort((a, b) => b.scrollHeight - a.scrollHeight);\n    if (topN !== void 0) {\n      return scrollableElements.slice(0, topN);\n    }\n    return scrollableElements;\n  }\n  async function getScrollableElementXpaths(topN) {\n    const scrollableElems = getScrollableElements(topN);\n    const xpaths = [];\n    for (const elem of scrollableElems) {\n      const allXPaths = await generateXPathsForElement(elem);\n      const firstXPath = allXPaths?.[0] || \"\";\n      xpaths.push(firstXPath);\n    }\n    return xpaths;\n  }\n  function getNearestScrollableParent(el) {\n    const allScrollables = getScrollableElements();\n    let current = el;\n    while (current) {\n      if (allScrollables.includes(current)) {\n        return current;\n      }\n      current = current.parentElement;\n    }\n    return document.documentElement;\n  }\n  async function processDom(chunksSeen) {\n    const { chunk, chunksArray } = await pickChunk(chunksSeen);\n    const container = new GlobalPageContainer();\n    const chunkSize = container.getViewportHeight();\n    const startOffset = chunk * chunkSize;\n    const endOffset = startOffset;\n    const domChunks = await container.collectDomChunks(\n      startOffset,\n      endOffset,\n      chunkSize,\n      true,\n      false,\n      // scrollBackToTop\n      void 0\n      // BFS entire doc\n    );\n    const [domChunk] = domChunks;\n    if (!domChunk) {\n      return {\n        outputString: \"\",\n        selectorMap: {},\n        chunk,\n        chunks: chunksArray\n      };\n    }\n    console.log(\"Extracted DOM chunk:\\n\", domChunk.outputString);\n    return {\n      outputString: domChunk.outputString,\n      selectorMap: domChunk.selectorMap,\n      chunk,\n      chunks: chunksArray\n    };\n  }\n  async function processAllOfDom(xpath) {\n    let candidateElementContainer = null;\n    let scrollTarget;\n    if (xpath) {\n      const node = getNodeFromXpath(xpath);\n      if (node) {\n        candidateElementContainer = node;\n        console.log(`Found element via XPath: ${xpath}`);\n        const scrollableElem = getNearestScrollableParent(\n          candidateElementContainer\n        );\n        if (scrollableElem === document.documentElement) {\n          scrollTarget = new GlobalPageContainer();\n        } else {\n          scrollTarget = new ElementContainer(scrollableElem);\n        }\n        await scrollTarget.scrollIntoView(candidateElementContainer);\n        const startOffset2 = scrollTarget.getScrollPosition();\n        const scrollTargetHeight = scrollTarget.getViewportHeight();\n        const rect = candidateElementContainer.getBoundingClientRect();\n        if (rect.height <= scrollTargetHeight) {\n          console.log(\n            \"Element is smaller/equal to container\\u2019s viewport. Doing single chunk.\"\n          );\n          const domChunks2 = await scrollTarget.collectDomChunks(\n            startOffset2,\n            // startOffset\n            startOffset2,\n            // endOffset => same as start => 1 chunk\n            1,\n            // chunkSize=1 => doesn't matter, because start==end means exactly 1 iteration\n            true,\n            true,\n            candidateElementContainer\n          );\n          const singleChunkOutput = combineChunks(domChunks2);\n          console.log(\n            \"Final output (single-chunk):\",\n            singleChunkOutput.outputString\n          );\n          return singleChunkOutput;\n        }\n        console.log(\"Element is bigger. Doing multi-chunk approach.\");\n      } else {\n        console.warn(`XPath not found: ${xpath}. Using entire doc.`);\n      }\n    } else {\n      const scrollableElems = getScrollableElements(1);\n      const mainScrollable = scrollableElems[0];\n      scrollTarget = mainScrollable === document.documentElement ? createStagehandContainer(window) : createStagehandContainer(mainScrollable);\n    }\n    const startOffset = scrollTarget.getScrollPosition();\n    const viewportHeight = scrollTarget.getViewportHeight();\n    const maxScroll = candidateElementContainer ? startOffset + candidateElementContainer.getBoundingClientRect().height : scrollTarget.getScrollHeight();\n    const chunkSize = viewportHeight;\n    console.log(\"processAllOfDom chunk-based from\", startOffset, \"to\", maxScroll);\n    const domChunks = await scrollTarget.collectDomChunks(\n      startOffset,\n      maxScroll,\n      chunkSize,\n      true,\n      true,\n      candidateElementContainer ?? void 0\n    );\n    const finalOutput = combineChunks(domChunks);\n    console.log(\n      \"All DOM elements combined (chunk-based):\",\n      finalOutput.outputString\n    );\n    return finalOutput;\n  }\n  function combineChunks(domChunks) {\n    const outputString = domChunks.map((c) => c.outputString).join(\"\");\n    let finalSelectorMap = {};\n    domChunks.forEach((c) => {\n      finalSelectorMap = { ...finalSelectorMap, ...c.selectorMap };\n    });\n    return { outputString, selectorMap: finalSelectorMap };\n  }\n  function storeDOM(xpath) {\n    if (!xpath) {\n      const originalDOM = document.body.cloneNode(true);\n      console.log(\"DOM state stored (root).\");\n      return originalDOM.outerHTML;\n    } else {\n      const node = getNodeFromXpath(xpath);\n      if (!node) {\n        console.error(\n          `storeDOM: No element found for xpath: ${xpath}. Returning empty string.`\n        );\n        return \"\";\n      }\n      console.log(`DOM state stored (element at xpath: ${xpath}).`);\n      return node.outerHTML;\n    }\n  }\n  function restoreDOM(storedDOM, xpath) {\n    console.log(\"Restoring DOM...\");\n    if (!storedDOM) {\n      console.error(\"No DOM state was provided.\");\n      return;\n    }\n    if (!xpath) {\n      document.body.innerHTML = storedDOM;\n      console.log(\"DOM restored (root).\");\n    } else {\n      const node = getNodeFromXpath(xpath);\n      if (!node) {\n        console.error(\n          `restoreDOM: No element found for xpath: ${xpath}. Cannot restore.`\n        );\n        return;\n      }\n      node.outerHTML = storedDOM;\n      console.log(`DOM restored (element at xpath: ${xpath}).`);\n    }\n  }\n  function createTextBoundingBoxes(xpath) {\n    const style = document.createElement(\"style\");\n    document.head.appendChild(style);\n    if (style.sheet) {\n      style.sheet.insertRule(\n        `\n      .stagehand-highlighted-word, .stagehand-space {\n        border: 0px solid orange;\n        display: inline-block !important;\n        visibility: visible;\n      }\n    `,\n        0\n      );\n      style.sheet.insertRule(\n        `\n        code .stagehand-highlighted-word, code .stagehand-space,\n        pre .stagehand-highlighted-word, pre .stagehand-space {\n          white-space: pre-wrap;\n          display: inline !important;\n      }\n     `,\n        1\n      );\n    }\n    function applyHighlighting(root) {\n      const containerSelector = root instanceof Document ? \"body *\" : \"*\";\n      root.querySelectorAll(containerSelector).forEach((element) => {\n        if (element.closest && element.closest(\".stagehand-nav, .stagehand-marker\")) {\n          return;\n        }\n        if ([\"SCRIPT\", \"STYLE\", \"IFRAME\", \"INPUT\"].includes(element.tagName)) {\n          return;\n        }\n        const childNodes = Array.from(element.childNodes);\n        childNodes.forEach((node) => {\n          if (node.nodeType === 3 && node.textContent?.trim().length > 0) {\n            const textContent = node.textContent.replace(/\\u00A0/g, \" \");\n            const tokens = textContent.split(/(\\s+)/g);\n            const fragment = document.createDocumentFragment();\n            const parentIsCode = element.tagName === \"CODE\";\n            tokens.forEach((token) => {\n              const span = document.createElement(\"span\");\n              span.textContent = token;\n              if (parentIsCode) {\n                span.style.whiteSpace = \"pre-wrap\";\n                span.style.display = \"inline\";\n              }\n              span.className = token.trim().length === 0 ? \"stagehand-space\" : \"stagehand-highlighted-word\";\n              fragment.appendChild(span);\n            });\n            if (fragment.childNodes.length > 0 && node.parentNode) {\n              element.insertBefore(fragment, node);\n              node.remove();\n            }\n          }\n        });\n      });\n    }\n    if (!xpath) {\n      applyHighlighting(document);\n      document.querySelectorAll(\"iframe\").forEach((iframe) => {\n        try {\n          iframe.contentWindow?.postMessage({ action: \"highlight\" }, \"*\");\n        } catch (error) {\n          console.error(\"Error accessing iframe content: \", error);\n        }\n      });\n    } else {\n      const node = getNodeFromXpath(xpath);\n      if (!node) {\n        console.warn(\n          `createTextBoundingBoxes: No element found for xpath \"${xpath}\".`\n        );\n        return;\n      }\n      applyHighlighting(node);\n    }\n  }\n  function getElementBoundingBoxes(xpath) {\n    const element = getNodeFromXpath(xpath);\n    if (!element) return [];\n    const isValidText = (text) => text && text.trim().length > 0;\n    let dropDownElem = element.querySelector(\"option[selected]\");\n    if (!dropDownElem) {\n      dropDownElem = element.querySelector(\"option\");\n    }\n    if (dropDownElem) {\n      const elemText = dropDownElem.textContent || \"\";\n      if (isValidText(elemText)) {\n        const parentRect = element.getBoundingClientRect();\n        return [\n          {\n            text: elemText.trim(),\n            top: parentRect.top + window.scrollY,\n            left: parentRect.left + window.scrollX,\n            width: parentRect.width,\n            height: parentRect.height\n          }\n        ];\n      } else {\n        return [];\n      }\n    }\n    let placeholderText = \"\";\n    if ((element.tagName.toLowerCase() === \"input\" || element.tagName.toLowerCase() === \"textarea\") && element.placeholder) {\n      placeholderText = element.placeholder;\n    } else if (element.tagName.toLowerCase() === \"a\") {\n      placeholderText = \"\";\n    } else if (element.tagName.toLowerCase() === \"img\") {\n      placeholderText = element.alt || \"\";\n    }\n    const words = element.querySelectorAll(\n      \".stagehand-highlighted-word\"\n    );\n    const boundingBoxes = Array.from(words).map((word) => {\n      const rect = word.getBoundingClientRect();\n      return {\n        text: word.innerText || \"\",\n        top: rect.top + window.scrollY,\n        left: rect.left + window.scrollX,\n        width: rect.width,\n        height: rect.height * 0.75\n      };\n    }).filter(\n      (box) => box.width > 0 && box.height > 0 && box.top >= 0 && box.left >= 0 && isValidText(box.text)\n    );\n    if (boundingBoxes.length === 0) {\n      const elementRect = element.getBoundingClientRect();\n      return [\n        {\n          text: placeholderText,\n          top: elementRect.top + window.scrollY,\n          left: elementRect.left + window.scrollX,\n          width: elementRect.width,\n          height: elementRect.height * 0.75\n        }\n      ];\n    }\n    return boundingBoxes;\n  }\n  window.processDom = processDom;\n  window.processAllOfDom = processAllOfDom;\n  window.storeDOM = storeDOM;\n  window.restoreDOM = restoreDOM;\n  window.createTextBoundingBoxes = createTextBoundingBoxes;\n  window.getElementBoundingBoxes = getElementBoundingBoxes;\n  window.createStagehandContainer = createStagehandContainer;\n  window.getScrollableElementXpaths = getScrollableElementXpaths;\n  window.getNodeFromXpath = getNodeFromXpath;\n  async function pickChunk(chunksSeen) {\n    const viewportHeight = calculateViewportHeight();\n    const documentHeight = document.documentElement.scrollHeight;\n    const chunks = Math.ceil(documentHeight / viewportHeight);\n    const chunksArray = Array.from({ length: chunks }, (_, i) => i);\n    const chunksRemaining = chunksArray.filter((chunk2) => {\n      return !chunksSeen.includes(chunk2);\n    });\n    const currentScrollPosition = window.scrollY;\n    const closestChunk = chunksRemaining.reduce((closest, current) => {\n      const currentChunkTop = viewportHeight * current;\n      const closestChunkTop = viewportHeight * closest;\n      return Math.abs(currentScrollPosition - currentChunkTop) < Math.abs(currentScrollPosition - closestChunkTop) ? current : closest;\n    }, chunksRemaining[0]);\n    const chunk = closestChunk;\n    if (chunk === void 0) {\n      throw new Error(`No chunks remaining to check: ${chunksRemaining}`);\n    }\n    return {\n      chunk,\n      chunksArray\n    };\n  }\n\n  // lib/dom/debug.ts\n  async function debugDom() {\n    window.chunkNumber = 0;\n    const container = new GlobalPageContainer();\n    const chunkSize = container.getViewportHeight();\n    const startOffset = container.getScrollPosition();\n    const endOffset = startOffset;\n    const singleChunks = await container.collectDomChunks(\n      startOffset,\n      endOffset,\n      chunkSize,\n      false,\n      false,\n      // Don't scroll back to top\n      void 0\n      // BFS entire doc\n    );\n    const [singleChunk] = singleChunks;\n    if (!singleChunk) {\n      console.warn(\"No chunk was returned. Possibly empty doc?\");\n      return;\n    }\n    const multiSelectorMap = singleChunk.selectorMap;\n    const selectorMap = multiSelectorMapToSelectorMap(multiSelectorMap);\n    drawChunk(selectorMap);\n  }\n  function multiSelectorMapToSelectorMap(multiSelectorMap) {\n    return Object.fromEntries(\n      Object.entries(multiSelectorMap).map(([key, selectors]) => [\n        Number(key),\n        selectors[0]\n      ])\n    );\n  }\n  function drawChunk(selectorMap) {\n    if (!window.showChunks) return;\n    cleanupMarkers();\n    Object.values(selectorMap).forEach((selector) => {\n      const element = getNodeFromXpath(selector);\n      if (element) {\n        let rect;\n        if (element.nodeType === Node.ELEMENT_NODE) {\n          rect = element.getBoundingClientRect();\n        } else {\n          const range = document.createRange();\n          range.selectNodeContents(element);\n          rect = range.getBoundingClientRect();\n        }\n        const color = \"grey\";\n        const overlay = document.createElement(\"div\");\n        overlay.style.position = \"absolute\";\n        overlay.style.left = `${rect.left + window.scrollX}px`;\n        overlay.style.top = `${rect.top + window.scrollY}px`;\n        overlay.style.padding = \"2px\";\n        overlay.style.width = `${rect.width}px`;\n        overlay.style.height = `${rect.height}px`;\n        overlay.style.backgroundColor = color;\n        overlay.className = \"stagehand-marker\";\n        overlay.style.opacity = \"0.3\";\n        overlay.style.zIndex = \"1000000000\";\n        overlay.style.border = \"1px solid\";\n        overlay.style.pointerEvents = \"none\";\n        document.body.appendChild(overlay);\n      }\n    });\n  }\n  async function cleanupDebug() {\n    cleanupMarkers();\n  }\n  function cleanupMarkers() {\n    const markers = document.querySelectorAll(\".stagehand-marker\");\n    markers.forEach((marker) => {\n      marker.remove();\n    });\n  }\n  window.debugDom = debugDom;\n  window.cleanupDebug = cleanupDebug;\n})();\n";