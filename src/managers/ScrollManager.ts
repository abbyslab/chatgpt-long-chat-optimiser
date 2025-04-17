import OverlayUI from "@components/OverlayUI";
import ScrollButton from "@components/ScrollButton";
import { CONFIG } from "@config/config";
import VirtualChatManager from "@managers/VirtualChatManager";
import { Logger } from "@utils/utils";

/**
 * Manages scroll events and related UI updates for the chat conversation.
 */
export default class ScrollManager {
  chatManager: VirtualChatManager;
  scrollButton: ScrollButton;
  overlay: OverlayUI | null;
  container: Element | null;
  lastScrollTop: number;
  scrollHandler: any;
  scrollIntervalId: any;

  /**
   * @param {VirtualChatManager} chatManager - Manages message caching and DOM updates.
   * @param {ScrollButton} scrollButton - Custom scroll button instance.
   * @param {OverlayUI} [overlayUI=null] - Optional overlay UI for debug stats.
   */
  constructor(
    chatManager: VirtualChatManager,
    scrollButton: ScrollButton,
    overlayUI: OverlayUI | null = null
  ) {
    this.chatManager = chatManager;
    this.scrollButton = scrollButton;
    this.overlay = overlayUI;

    this.container = null; // The conversation container element
    this.lastScrollTop = 0; // Stores the last known scroll position
    this.scrollHandler = this.onScroll.bind(this);
  }

  getStats() {
    return {
      scrollTop: this.container?.scrollTop,
      clientHeight: this.container?.clientHeight,
      scrollHeight: this.container?.scrollHeight,
    };
  }

  /**
   * Attaches the scroll event listener to the conversation container.
   * Retries every second if the container is not found.
   */
  attach() {
    this.container = this.chatManager.getContainer();
    if (!this.container) {
      Logger.warn("ScrollManager", "Container not found. Retrying...");
      setTimeout(() => this.attach(), 1000);
      return;
    }

    this.container.addEventListener("scroll", this.scrollHandler);
    Logger.debug("ScrollManager", "Scroll event attached.");
  }

  /**
   * Handles scroll events by extending the visible window if needed,
   * updating the scroll button visibility, and updating the overlay stats.
   */
  onScroll() {
    Logger.debug("SCROLLING");
    if (!this.container || window.disableAutoScroll) return;

    const scrollingUp = this.container?.scrollTop < this.lastScrollTop;
    this.lastScrollTop = this.container?.scrollTop;

    const topTrigger = this.container?.scrollTop < CONFIG.TOP_THRESHOLD;

    if (scrollingUp && topTrigger) {
      const extended = this.chatManager.extendWindowBackward();
      if (extended) {
        this.chatManager.resyncDOM(this.container);
      }
    }

    this.scrollButton.updateVisibility();

    if (this.overlay) {
      Logger.debug("ScrollManager", "Scrolled. Updating overlay.");
      this.overlay.updateStats(this.chatManager.getLoadedStats());
    } else {
      Logger.error("ScrollManager", "Overlay UI not found.");
    }
  }

  /**
   * Forces the container to scroll to the bottom by incrementally adjusting scrollTop.
   * Uses an interval that clears after reaching the bottom or after a maximum number of attempts.
   * @param {Element} container - The container element (defaults to the one from chatManager).
   */
  forceScrollToBottom(container = this.chatManager.getContainer()) {
    if (!container) return;

    window.disableAutoScroll = true;
    let attempts = 0;
    const maxAttempts = 10;

    if (this.scrollIntervalId) clearInterval(this.scrollIntervalId);
    this.scrollIntervalId = setInterval(() => {
      attempts++;
      const lastChild = container.lastElementChild;
      if (!lastChild || attempts >= maxAttempts) {
        clearInterval(this.scrollIntervalId);
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
        clearInterval(this.scrollIntervalId);
        this.scrollIntervalId = null;
        window.disableAutoScroll = false;
      }
    }, 100);
  }

  destroy() {
    if (this.scrollIntervalId) clearInterval(this.scrollIntervalId);
    this.container?.removeEventListener("scroll", this.scrollHandler);
  }
}
