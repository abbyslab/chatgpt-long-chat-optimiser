import OverlayUI from "@components/OverlayUI";
import ScrollButton from "@components/ScrollButton";
import { CONFIG } from "@config/config";
import VirtualChatManager from "@managers/VirtualChatManager";
import DebugStatistics from "@utils/DebugStatistics";
import { Logger, outerTag } from "@utils/utils";

/**
 * Manages scroll events and related UI updates for the chat conversation.
 */
export default class ScrollManager {
  private chatManager: VirtualChatManager;
  private scrollButton: ScrollButton;
  private container: Element | null;
  private scrollHandler: EventListenerOrEventListenerObject;
  private scrollIntervalId: number | null;
  private updateIntervalId: number | null;

  /**
   * Creates a new ScrollManager instance.
   * 
   * @param chatManager - Manages message caching and DOM updates.
   * @param scrollButton - Custom scroll button instance.
   */
  public constructor(
    chatManager: VirtualChatManager,
    scrollButton: ScrollButton
  ) {
    this.chatManager = chatManager;
    this.scrollButton = scrollButton;
    this.container = null; // The conversation container element
    this.scrollHandler = this.updateIfNeeded.bind(this);
    this.scrollIntervalId = null;
    this.updateIntervalId = null;

    this.attach();
  }

  /**
   * Returns the current scroll statistics of the container.
   * 
   * @returns An object containing scroll position information.
   */
  public getStats(): Partial<DebugStatistics> {
    if (!this.container) {
      return { scrollTop: 0, clientHeight: 0, scrollHeight: 0 };
    }

    return {
      scrollTop: this.container.scrollTop || 0,
      clientHeight: this.container.clientHeight || 0,
      scrollHeight: this.container.scrollHeight || 0,
    };
  }

  /**
   * Attaches the scroll event listener to the conversation container.
   * Retries every 500ms if the container is not found.
   * 
   * @private
   */
  private attach(): void {
    const tryBind = (): void => {
      this.container = this.chatManager.getConversationContainer();
      if (!this.container) {
        Logger.warn("ScrollManager", "Container not found. Retrying...");
        setTimeout(tryBind, 500);
        return;
      }
      Logger.debug("ScrollManager", "Container before attaching scroll listener:");
      Logger.debug("ScrollManager", `  ${outerTag(this.container as HTMLElement)}`);
      this.container.addEventListener("scroll", this.scrollHandler, { passive: true });
      this.updateIntervalId = window.setTimeout(() => this.scrollHandler, 1000);
      Logger.debug("ScrollManager", "Scroll event attached.");
    };
    tryBind();
  }

  /**
   * Checks if old or new messages need to be loaded based on scrolled distance.
   * Also updates the scroll button visibility and the overlay stats.
   */
  public updateIfNeeded(): void {
    if (!this.container || window.disableAutoScroll) return;

    const scrollHeight = this.container.scrollHeight; // Height of scrollable area
    const clientHeight = this.container.clientHeight; // Height of visible area
    const scrollTop = this.container.scrollTop;       // Distance from top of scrollable area to the top of visible area

    const adjustedTopThreshold = Math.min(CONFIG.TOP_THRESHOLD, clientHeight / 2);
    const adjustedBottomThreshold = Math.min(CONFIG.BOTTOM_THRESHOLD, clientHeight / 2);

    const topTrigger = scrollTop < adjustedTopThreshold;
    const bottomTrigger = scrollTop + clientHeight > scrollHeight - adjustedBottomThreshold;

    // Ensure triggers are mutually exclusive
    if (topTrigger && bottomTrigger) {
      Logger.warn(
        "ScrollManager",
        "Both topTrigger and bottomTrigger are active. Adjust CONFIG thresholds or window size."
      );
      return; // Prevent conflicting actions
    }

    let changed = false;

    // Load older messages if near the top
    if (topTrigger) {
      Logger.debug(
        "ScrollManager",
        "Near the top. Attempting to load older messages..."
      );
      changed ||= this.chatManager.scrollWindowUp();
    }

    // Load newer messages if near the bottom
    if (bottomTrigger) {
      Logger.debug(
        "ScrollManager",
        "Near the bottom. Attempting to load newer messages..."
      );
      changed ||= this.chatManager.scrollWindowDown();
    }

    if (changed) {
      window.disableAutoScroll = true;
      window.setTimeout(() => {
        window.disableAutoScroll = false;
      }, 50);
    }

    // Update the scroll button visibility
    this.scrollButton.updateVisibility();

    // Update the overlay stats
    OverlayUI.getInstance().updateStats({
      ...this.chatManager.getStats(),
      ...this.getStats(),
    });
  }

  /**
   * Forces the container to scroll to the bottom by incrementally adjusting scrollTop.
   * Uses an interval that clears after reaching the bottom or after a maximum number of attempts.
   * 
   * @param container - The container element (defaults to the one from chatManager).
   */
  public forceScrollToBottom(container: Element | null = this.chatManager.getConversationContainer()): void {
    if (!container) return;

    this.chatManager.scrollWindowToBottom();

    window.disableAutoScroll = true;
    let attempts = 0;
    const maxAttempts = 10;

    if (this.scrollIntervalId) window.clearInterval(this.scrollIntervalId);
    this.scrollIntervalId = window.setInterval(() => {
      attempts++;
      const lastChild = container.lastElementChild;
      if (!lastChild || attempts >= maxAttempts) {
        if (this.scrollIntervalId) window.clearInterval(this.scrollIntervalId);
        this.scrollIntervalId = null;
        window.disableAutoScroll = false;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const childRect = lastChild.getBoundingClientRect();
      const offset = childRect.bottom - containerRect.bottom;

      Logger.debug(
        "ScrollManager",
        `Scroll attempt ${attempts}: offset=${offset.toFixed(2)}`
      );

      if (offset > 5) {
        container.scrollTop += offset;
      } else {
        if (this.scrollIntervalId) window.clearInterval(this.scrollIntervalId);
        this.scrollIntervalId = null;
        window.disableAutoScroll = false;
      }
    }, 100);
  }

  /**
   * Cleans up resources when the manager is no longer needed.
   */
  public destroy(): void {
    if (this.scrollIntervalId) window.clearInterval(this.scrollIntervalId);
    if (this.updateIntervalId) window.clearInterval(this.updateIntervalId);
    if (this.container && this.scrollHandler) {
      this.container.removeEventListener("scroll", this.scrollHandler);
    }
  }
}
