import { CONFIG } from "@config/config";
import { SELECTORS } from "@config/constants";
import { getNodeId, Logger } from "@utils/utils";

/**
 * Manages the caching and virtual rendering of chat messages.
 */
export default class VirtualChatManager {
  allTurns: HTMLElement[];
  nodeCache: Map<any, any>;
  lowestIndex: number;
  highestIndex: number;
  containerCache: Element | null;

  constructor() {
    this.allTurns = []; // Array of all message nodes
    this.nodeCache = new Map(); // Cache mapping node IDs to nodes
    this.lowestIndex = 0; // First visible message index
    this.highestIndex = 0; // Last visible message index
    this.containerCache = null; // Cached reference to the conversation container
  }

  /**
   * Returns the conversation container element.
   * Caches the result for performance.
   * @returns {Element} The conversation container element.
   */
  getConversationContainer(): Element | null {
    if (this.containerCache) return this.containerCache;
    this.containerCache =
      document.querySelector(SELECTORS.CONVERSATION_TURN)?.parentElement ||
      document.querySelector(SELECTORS.CHAT_CONTAINER);
    return this.containerCache;
  }

  /**
   * Clears and rebuilds the cache of message nodes.
   */
  rebuildMessageCache() {
    this.allTurns = [];
    this.nodeCache.clear();

    const container: Element | null = this.getConversationContainer();
    if (!container) return;

    // Query the container for all message articles
    const articles = container.querySelectorAll(SELECTORS.CONVERSATION_TURN);
    articles.forEach((article: any) => {
      const id = getNodeId(article);
      if (id) {
        this.nodeCache.set(id, article);
        this.allTurns.push(article);
      }
    });

    Logger.debug(
      "VirtualChatManager",
      `Cache rebuilt. Total messages: ${this.allTurns.length}`
    );
  }

  /**
   * Updates the indices that define the currently visible window of messages.
   */
  updateWindowIndices() {
    this.highestIndex = this.allTurns.length - 1;
    this.lowestIndex = Math.max(
      0,
      this.highestIndex - (CONFIG.KEEP_RECENT - 1)
    );

    Logger.debug(
      "VirtualChatManager",
      `Window indices updated: lowest=${this.lowestIndex}, highest=${this.highestIndex}`
    );
  }

  /**
   * Updates the DOM to show only the messages within the current visible window.
   * @param {Element} container - The container element (default is the cached container).
   */
  resyncDOM(container = this.getConversationContainer()) {
    if (!container) return;

    this.allTurns.forEach((node, index) => {
      node.style.display =
        index >= this.lowestIndex && index <= this.highestIndex ? "" : "none";
    });

    Logger.debug(
      "VirtualChatManager",
      `DOM resynced. Showing ${
        this.highestIndex - this.lowestIndex + 1
      } messages.`
    );
  }

  /**
   * Extends the visible window by lowering the lowest index.
   * @returns {boolean} True if the window was extended, false otherwise.
   */
  extendWindowBackward() {
    const prevLowest = this.lowestIndex;
    this.lowestIndex = Math.max(0, this.lowestIndex - CONFIG.CHUNK_SIZE);
    return this.lowestIndex !== prevLowest;
  }

  /**
   * Alias for getConversationContainer.
   * @returns {Element} The conversation container element.
   */
  getContainer() {
    return this.getConversationContainer();
  }

  /**
   * Returns statistics about the currently loaded messages.
   * @returns {Object} An object with 'visible' and 'total' message counts.
   */
  getLoadedStats() {
    return {
      turnsVisible: this.highestIndex - this.lowestIndex + 1,
      turnsTotal: this.allTurns.length,
    };
  }

  /**
   * Adds a new message node to the cache if it is not already present.
   * @param {HTMLElement} node - The message node to add.
   * @returns {boolean} True if the node was added, false otherwise.
   */
  addNewNode(node: HTMLElement) {
    const id: string = getNodeId(node);
    const isPresent: boolean = !this.nodeCache.has(id);
    
    if (isPresent) {
      this.nodeCache.set(id, node);
      this.allTurns.push(node);
    }

    return isPresent;
  }
}
