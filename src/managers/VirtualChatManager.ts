import { CONFIG } from "@config/config";
import { SELECTORS } from "@config/constants";
import DebugStatistics from "@utils/DebugStatistics";
import { getChatContainer, getNodeId, Logger } from "@utils/utils";

/**
 * Manages the caching and virtual rendering of chat messages.
 */
export default class VirtualChatManager {
  /** Array of all message nodes */
  private allTurns: HTMLElement[];
  /** Cache mapping node IDs to nodes */
  private nodeCache: Map<string, HTMLElement>;
  /** First visible message index */
  private lowestIndex: number;
  /** Last visible message index */
  private highestIndex: number;
  /** Cached reference to the conversation container */
  private containerCache: Element | null;

  /**
   * Initialises a new instance of VirtualChatManager
   */
  public constructor() {
    this.allTurns = [];
    this.nodeCache = new Map<string, HTMLElement>();
    this.lowestIndex = 0;
    this.highestIndex = 0;
    this.containerCache = null;
  }

  /**
   * Returns the conversation container element.
   * Caches the result for performance.
   * @returns The conversation container element or null if not found
   */
  getConversationContainer(): Element | null {
    return this.containerCache ??= getChatContainer();
  }

  /**
   * Clears and rebuilds the cache of message nodes.
   * @returns void
   */
  public rebuildMessageCache(): void {
    this.allTurns = [];
    this.nodeCache.clear();

    const container: Element | null = this.getConversationContainer();
    if (!container) return;

    // Query the container for all message articles
    const articles: NodeListOf<Element> = container.querySelectorAll(SELECTORS.CONVERSATION_TURN);
    articles.forEach((article: Element) => {
      const id: string = getNodeId(article as HTMLElement);
      if (id) {
        this.nodeCache.set(id, article as HTMLElement);
        this.allTurns.push(article as HTMLElement);
      }
    });

    Logger.debug(
      "VirtualChatManager",
      `Cache rebuilt. Total messages: ${this.allTurns.length}`
    );
  }

  /**
   * Updates the DOM to show only the messages within the current visible window.
   * @param container - The container element (default is the cached container)
   * @returns void
   */
  private updateDOM(): void {
    const container: Element | null = this.getConversationContainer();
    if (!container) return;

    this.allTurns.forEach((node: HTMLElement, index: number) => {
      node.style.display =
        index >= this.lowestIndex && index <= this.highestIndex ? "" : "none";
    });

    Logger.debug(
      "VirtualChatManager",
      `DOM resynced. Showing ${this.highestIndex - this.lowestIndex + 1
      } messages.`
    );
  }

  /**
   * Changes the visible window by changing the range of conversation turn indices that are visible.
   * @returns True if the window was changed, false otherwise
   */
  private requestWindowChange(requestIndexLow: number, requestIndexHigh: number): boolean {
    if (this.allTurns.length === 0) return false;

    if (requestIndexLow > requestIndexHigh) {
      Logger.warn(
        "VirtualChatManager",
        `Invalid indices requested: low=${requestIndexLow} is higher than high=${requestIndexHigh}`
      );
      return false;
    }

    const prevLowest: number = this.lowestIndex;
    const prevHighest: number = this.highestIndex;

    const container: Element | null = this.getConversationContainer();
    const referenceNode: HTMLElement | undefined = this.allTurns[prevLowest];
    let refTopBefore = 0;
    if (container && referenceNode) {
      const containerRect = (container as HTMLElement).getBoundingClientRect();
      const refRect = referenceNode.getBoundingClientRect();
      refTopBefore = refRect.top - containerRect.top;
    }

    // Snap the requested indices to the edges if they are too large or small.
    const maxIndex = this.allTurns.length - 1;
    if (requestIndexLow < 0) {
      requestIndexLow = 0;
      requestIndexHigh = Math.min(CONFIG.WINDOW_SIZE - 1, maxIndex);
    } else if (requestIndexHigh > maxIndex) {
      requestIndexLow = Math.max(0, maxIndex - CONFIG.WINDOW_SIZE + 1);
      requestIndexHigh = maxIndex;
    }

    this.lowestIndex = requestIndexLow;
    this.highestIndex = requestIndexHigh;
    this.updateDOM();

    if (container && referenceNode) {
      const containerRect = (container as HTMLElement).getBoundingClientRect();
      const refRect = referenceNode.getBoundingClientRect();
      const refTopAfter = refRect.top - containerRect.top;
      const delta = refTopAfter - refTopBefore;
      if (delta !== 0) {
        (container as HTMLElement).scrollTop += delta;
      }
    }

    const isChanged = this.lowestIndex !== prevLowest || this.highestIndex !== prevHighest;
    if (isChanged) Logger.debug("VirtualChatManager", `Window changed: lowest=${this.lowestIndex}, highest=${this.highestIndex}`);
    return isChanged;
  }

  /**
   * Scrolls the visible window downward and hides older messages.
   * @returns True if the window was extended, false otherwise
   */
  public scrollWindowDown(): boolean {
    return this.requestWindowChange(
      this.lowestIndex + CONFIG.WINDOW_SIZE,
      this.highestIndex + CONFIG.WINDOW_SIZE
    );
  }

  /**
   * Scrolls the visible window upward and hides newer messages.
   * @returns True if the window was extended, false otherwise
   */
  public scrollWindowUp(): boolean {
    return this.requestWindowChange(
      this.lowestIndex - CONFIG.WINDOW_SIZE,
      this.highestIndex - CONFIG.WINDOW_SIZE
    );
  }

  /**
   * Moves the visible range to the end of the conversation.
   * @returns True if the window was moved, false otherwise
   */
  public scrollWindowToBottom(): boolean {
    const maxIndex = this.allTurns.length - 1;
    return this.requestWindowChange(
      maxIndex - CONFIG.WINDOW_SIZE,
      maxIndex
    );
  }

  /**
   * Returns statistics about the currently loaded messages.
   * @returns An object with the range of visible indices as well as 'visible' and 'total' message counts
   */
  public getStats(): Partial<DebugStatistics> {
    return {
      turnsIndexLow: this.lowestIndex,
      turnsIndexHigh: this.highestIndex,
      turnsVisible: this.highestIndex - this.lowestIndex + 1,
      turnsTotal: this.allTurns.length,
    };
  }

  /**
   * Adds a new message node to the cache if it is not already present.
   * @param node - The message node to add
   * @returns True if the node was added, false otherwise
   */
  public addNewNode(node: HTMLElement): boolean {
    const id: string = getNodeId(node);
    const isPresent: boolean = !this.nodeCache.has(id);

    if (isPresent) {
      this.nodeCache.set(id, node);
      this.allTurns.push(node);
    }

    return isPresent;
  }
}