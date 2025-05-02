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
  /** The chat manager instance */
  private chatManager: VirtualChatManager;
  /** The scroll manager instance, if set */
  private scrollManager: ScrollManager | null;
  /** Manager for cleanup operations */
  private lifeCycleManager: LifecycleManager;
  /** The custom scroll button element */
  private button: HTMLElement | null;
  /** The chat container element */
  private container: Element | null;
  /** Counter for native button discovery retries */
  private nativeButtonRetryCount: number;
  /** The bound click event handler */
  private boundHandleClick: (e: Event) => void;

  /**
   * Creates a new ScrollButton instance
   * @param {VirtualChatManager} chatManager - Instance of VirtualChatManager
   */
  constructor(chatManager: VirtualChatManager) {
    this.chatManager = chatManager;
    this.scrollManager = null;
    this.lifeCycleManager = new LifecycleManager();
    this.button = null;
    this.container = null;
    this.nativeButtonRetryCount = 0;
    this.boundHandleClick = this.handleClick.bind(this);
  }

  /**
   * Initialises the custom scroll button by cloning the native button.
   * Retries if the conversation container or native button is not found.
   * @returns {void}
   */
  public init(): void {
    this.container = this.chatManager.getConversationContainer();
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
    this.button.addEventListener("click", this.boundHandleClick);
    this.lifeCycleManager?.register(() => {
      this.button?.removeEventListener("click", this.boundHandleClick);
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
   * @param {Event} e - The click event
   * @returns {void}
   */
  public handleClick(e: Event): void {
    // Ensure the handler performs necessary operations safely
    e.preventDefault();
    e.stopPropagation();

    Logger.debug("ScrollButton", "Button clicked.");

    if (!this.container) {
      Logger.error("ScrollButton", "Container is not available.");
      return;
    }

    try {
      window.disableAutoScroll = true;

      this.chatManager.rebuildMessageCache();
      this.chatManager.scrollWindowToBottom();
      
      if (this.scrollManager) {
        this.scrollManager.forceScrollToBottom(this.container);
      } else {
        Logger.warn("ScrollButton", "ScrollManager is not set.");
      }

      setTimeout(() => {
        window.disableAutoScroll = false;
      }, 1500);
    } catch (error) {
      Logger.error("ScrollButton", "Error occurred during click handling:", String(error));
    }
  }

  /**
   * Updates the button's visibility based on the scroll position.
   * Hides the button when near the bottom of the container.
   * @returns {void}
   */
  public updateVisibility(): void {
    if (!this.button || !this.container) return;

    const scrollTop: number = this.container.scrollTop;
    const clientHeight: number = this.container.clientHeight;
    const scrollHeight: number = this.container.scrollHeight;
    const dynamicBottomThreshold: number = clientHeight * CONFIG.DYNAMIC_BOTTOM_RATIO;
    const nearBottom: boolean =
      scrollTop + clientHeight >= scrollHeight - dynamicBottomThreshold;

    this.button.style.display = nearBottom ? "none" : "";

    Logger.debug(
      "ScrollButton",
      `Visibility updated. Near bottom: ${nearBottom}`
    );
  }

  /**
   * Sets or updates the scrollManager instance.
   * @param {ScrollManager} scrollManager - The ScrollManager instance
   * @returns {void}
   */
  public setScrollManager(scrollManager: ScrollManager): void {
    this.scrollManager = scrollManager;
  }

  /**
   * Cleans up resources and event listeners when the component is destroyed.
   * @returns {void}
   */
  public destroy(): void {
    this.lifeCycleManager?.cleanupAll();
  }
}
