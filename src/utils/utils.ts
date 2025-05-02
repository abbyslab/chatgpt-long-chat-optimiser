import { CONFIG } from "@config/config";
import { SELECTORS } from "@config/constants";

/**
 * Retrieves a unique identifier for a DOM node.
 * If the node does not have a data-testid attribute, a fallback ID is generated,
 * logged (if debugging is enabled), and assigned to the node.
 *
 * @param {HTMLElement} node - The DOM element for which to obtain an ID.
 * @returns {string} The node's unique identifier.
 */
export function getNodeId(node: HTMLElement): string {
  let id: string | undefined = node.dataset.testid;
  if (!id) {
    id = `fallback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    Logger.warn("utils", "Missing testid for node. Generated fallback ID:", id);
    node.dataset.testid = id;
  }
  return id;
}

/**
 * Debug-only logger that outputs a message to the console.
 */
export class Logger {
  public static debug(tag: string, ...args: string[]): void {
    if (CONFIG.DEBUG) console.log(`[${tag}]`, ...args);
  }

  public static error(tag: string, ...args: string[]): void {
    if (CONFIG.DEBUG) console.error(`[${tag}]`, ...args);
  }

  public static warn(tag: string, ...args: string[]): void {
    if (CONFIG.DEBUG) console.warn(`[${tag}]`, ...args);
  }
}

export function anyToString(x: any): string {
  if (x === null) return "null: null";

  const MAX_LEN = 64;
  function truncate(s: string): string {
    return s.length > MAX_LEN ? s.slice(0, MAX_LEN) + "…" : s;
  }

  switch (typeof x) {
    case "undefined":
      return "undefined: undefined";
    case "string":
      return "string: " + x;
    case "number":
      return "number: " + x;
    case "boolean":
      return "boolean: " + x;
    case "bigint":
      return "bigint: " + x;
    case "symbol":
      return "symbol: " + String(x);
    case "function":
      return "function: " + truncate(x.name || "[anonymous]");
    case "object": {
      const rawTag = Object.prototype.toString.call(x); // "[object HTMLDivElement]"
      const tag = rawTag.slice(8, -1); // "HTMLDivElement"

      try {
        const json = JSON.stringify(x);
        if (json && json !== "{}") {
          return `${tag}: ${truncate(json)}`;
        }
      } catch { }

      // Fallback
      const str = String(x);
      if (str.startsWith("[object ")) {
        return `${tag}: [Unserialisable]`;
      }
      return `${tag}: ${truncate(str)}`;
    }
    default:
      return "[unknown type]: " + String(x);
  }
}

/**
 * Gets only the outer tag of an HTML element.
 * @param el - The element to get the outer tag of
 * @returns 
 */
export function outerTag(el: HTMLElement): string {
  return (el.cloneNode(false) as HTMLElement).outerHTML;
}

/**
 * Gets the scrollable chat container element from the DOM.
 */
export function getChatContainer(): Element | null {
  return document.querySelector(SELECTORS.CONVERSATION_TURN)
    ?.parentElement
    ?.parentElement 
    ?? null;
}