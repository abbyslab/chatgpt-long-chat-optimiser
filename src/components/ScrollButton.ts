import { CONFIG } from "@config/config";
import { IDS, SELECTORS } from "@config/constants";
import LifecycleManager from "@managers/LifeCycleManager";
import ScrollManager from "@managers/ScrollManager";
import VirtualChatManager from "@managers/VirtualChatManager";
import { Logger } from "@utils/utils";

/**
 * Provides a custom scroll-to-bottom button for improved UX.
 */
export default class ScrollButton {
  chatManager: VirtualChatManager;
  scrollManager: ScrollManager | null;
  lifeCycleManager: LifecycleManager;
  button: HTMLElement | null;
  container: Element | null;
  nativeButtonRetryCount: number;

  /**
   * @param {Object} chatManager - Instance of VirtualChatManager.
   * @param {Object} scrollManager - Instance of ScrollManager.
   */
  constructor(chatManager: VirtualChatManager) {
    this.chatManager = chatManager;
    this.scrollManager = null;
    this.lifeCycleManager = new LifecycleManager();
    this.button = null;
    this.container = null;
    this.nativeButtonRetryCount = 0;
  }

  /**
   * Initialises the custom scroll button by cloning the native button.
   * Retries if the conversation container or native button is not found.
   */
  init() {
    this.container = this.chatManager.getContainer();
    if (!this.container) {
      Logger.warn("ScrollButton", "Container not found. Retrying...");
      setTimeout(() => this.init(), 1000);
      return;
    }

    const nativeBtn: HTMLElement | null = document.querySelector(
      SELECTORS.SCROLL_BUTTON
    );

    if (!nativeBtn) {
      if (this.nativeButtonRetryCount < 3) {
        // Only log up to 3 times
        Logger.warn(
          "ScrollButton",
          "Native scroll button not found. Retrying..."
        );
      }
      this.nativeButtonRetryCount++;
      setTimeout(() => this.init(), 1000);
      return;
    }

    nativeBtn.style.display = "none";

    this.button = nativeBtn.cloneNode(true) as HTMLElement;
    this.button.id = IDS.CUSTOM_SCROLL_BUTTON;
    this.button.style.display = "";
    this.button.addEventListener("click", this.handleClick.bind(this));
    this.lifeCycleManager?.register(() => {
      this.button?.removeEventListener("click", this.handleClick.bind(this));
    });
    nativeBtn.parentElement?.appendChild(this.button as Node);
    this.lifeCycleManager?.register(() => {
      nativeBtn.parentElement?.removeChild(this.button as Node);
    });

    Logger.debug("ScrollButton", "Custom scroll button injected.");
  }

  /**
   * Handles the click event on the custom scroll button.
   * Rebuilds the message cache and forces scrolling to the bottom.
   * @param {Event} e - The click event.
   */
  handleClick(e: Event) {
    // TODO re-evaluate whether everything in this handler is what I want it to do
    e.preventDefault();
    e.stopPropagation();

    Logger.debug("ScrollButton", "Button clicked.");

    if (!this.container) return;

    window.disableAutoScroll = true;

    this.chatManager.rebuildMessageCache();
    this.chatManager.updateWindowIndices();
    this.chatManager.resyncDOM(this.container);

    this.scrollManager?.forceScrollToBottom(this.container);

    setTimeout(() => {
      window.disableAutoScroll = false;
    }, 1500);
  }

  /**
   * Updates the button's visibility based on the scroll position.
   */
  updateVisibility() {
    if (!this.button || !this.container) return;

    const scrollTop = this.container.scrollTop;
    const clientHeight = this.container.clientHeight;
    const scrollHeight = this.container.scrollHeight;
    const dynamicBottomThreshold = clientHeight * CONFIG.DYNAMIC_BOTTOM_RATIO;
    const nearBottom =
      scrollTop + clientHeight >= scrollHeight - dynamicBottomThreshold;

    this.button.style.display = nearBottom ? "none" : "";

    Logger.debug(
      "ScrollButton",
      `Visibility updated. Near bottom: ${nearBottom}`
    );
  }

  /**
   * Sets or updates the scrollManager instance.
   * @param {ScrollManager} scrollManager - The ScrollManager instance.
   */
  setScrollManager(scrollManager: ScrollManager) {
    this.scrollManager = scrollManager;
  }

  destroy() {
    this.lifeCycleManager?.cleanupAll();
  }
}
