import OverlayUI from "@components/OverlayUI";
import ScrollButton from "@components/ScrollButton";
import { CONFIG } from "@config/config";
import { SELECTORS } from "@config/constants";
import MutationWatcher from "@content/MutationWatcher";
import LifeCycleManager from "@managers/LifeCycleManager";
import ScrollManager from "@managers/ScrollManager";
import VirtualChatManager from "@managers/VirtualChatManager";
import { Logger } from "@utils/utils";

export default class Virtualiser {
  virtualChatManager: VirtualChatManager | null;
  scrollButton: ScrollButton | null;
  scrollManager: ScrollManager | null;
  overlay: OverlayUI | null;
  mutationWatcher: MutationWatcher | null;
  lifeCycleManager: LifeCycleManager | null;

  constructor() {
    this.virtualChatManager = null;
    this.scrollButton = null;
    this.scrollManager = null;
    this.overlay = null;
    this.mutationWatcher = null;
    this.lifeCycleManager = new LifeCycleManager();

    this.#initVirtualiser();
  }

  /**
   * Waits for the chat container to appear in the DOM.
   * Resolves as soon as the container element exists — even if no messages are loaded yet.
   * This supports "new chat" pages where no conversation-turn nodes are present initially.
   *
   * @returns {Promise<Element>} Resolves with the container element.
   */
  #waitForContainer() {
    return new Promise((resolve) => {
      /**
       * Tries to locate the chat container using known selectors.
       * If found, resolves immediately.
       */
      const tryFind = () => {
        const container =
          document.querySelector(SELECTORS.CONVERSATION_TURN)?.parentElement ||
          document.querySelector(SELECTORS.CHAT_CONTAINER);

        if (container) {
          resolve(container);
          return true;
        }

        return false;
      };

      // Try immediately before falling back to mutation-based detection
      if (tryFind()) return;

      // Use a MutationObserver to watch for container appearance
      const observer = new MutationObserver(() => {
        if (tryFind()) observer.disconnect();
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  #initVirtualChatManager() {
    this.virtualChatManager = new VirtualChatManager();
    this.virtualChatManager.rebuildMessageCache();
    this.virtualChatManager.updateWindowIndices();
    this.virtualChatManager.resyncDOM();
    Logger.debug("Virtualiser", "Created Virtual Chat Manager");
  }

  #initScrollSystem() {
    if (!this.virtualChatManager) return;

    this.scrollButton = new ScrollButton(this.virtualChatManager);
    this.scrollManager = new ScrollManager(
      this.virtualChatManager,
      this.scrollButton,
      this.overlay
    );

    this.scrollButton.setScrollManager(this.scrollManager);
    this.scrollButton.init();
    this.scrollManager.attach();
    Logger.debug("Virtualiser", "Created Scroll System");
  }

  #initDebugOverlay() {
    if (!this.virtualChatManager || !this.scrollManager) return;

    if (CONFIG.DEBUG) {
      this.overlay = new OverlayUI();
      this.overlay.updateStats(this.virtualChatManager.getLoadedStats());
      this.overlay.updateStats(this.scrollManager.getStats());

      this.lifeCycleManager?.register(() => this.overlay?.destroy());
    }
    Logger.debug("Virtualiser", "Created Debug Overlay");
  }

  #initMutationWatcher() {
    this.mutationWatcher = new MutationWatcher(
      this.virtualChatManager as VirtualChatManager,
      this.overlay
    );
    this.mutationWatcher.start();
    this.lifeCycleManager?.register(() => this.mutationWatcher?.stop());
    Logger.debug("Virtualiser", "Created Mutation Watcher");
  }

  #initVirtualiser() {
    this.#waitForContainer()
      .then(() => {
        Logger.debug("Virtualiser", "Initialising...");

        // Create virtualiser components
        this.#initVirtualChatManager();
        this.#initScrollSystem();
        this.#initDebugOverlay();
        this.#initMutationWatcher();

        Logger.debug("Virtualiser", "Initialisation succeeded.");
      })
      .catch((err) => {
        Logger.error("Virtualiser", `Initialisation failed: ${err}`);
      });
  }

  resetVirtualiser() {
    this.lifeCycleManager?.cleanupAll();
    this.#initVirtualiser();
  }

  toggleOverlay() {
    this.overlay?.updateStats(
      (this.virtualChatManager as VirtualChatManager).getLoadedStats()
    );
    this.overlay?.updateStats((this.scrollManager as ScrollManager).getStats());
    this.overlay?.toggle();
  }

  destroy() {
    this.lifeCycleManager?.cleanupAll();
  }
}
