import OverlayUI from "@components/OverlayUI";
import ScrollButton from "@components/ScrollButton";
import MutationWatcher from "@content/MutationWatcher";
import LifeCycleManager from "@managers/LifeCycleManager";
import ScrollManager from "@managers/ScrollManager";
import VirtualChatManager from "@managers/VirtualChatManager";
import { getChatContainer, Logger } from "@utils/utils";

export default class Virtualiser {
  private virtualChatManager: VirtualChatManager | null;
  private scrollButton: ScrollButton | null;
  private scrollManager: ScrollManager | null;
  private mutationWatcher: MutationWatcher | null;
  private lifeCycleManager: LifeCycleManager | null;

  public constructor() {
    this.virtualChatManager = null;
    this.scrollButton = null;
    this.scrollManager = null;
    this.mutationWatcher = null;
    this.lifeCycleManager = new LifeCycleManager();

    this.initVirtualiser();
  }

  /**
   * Waits for the chat container to appear in the DOM.
   * Resolves as soon as the container element exists — even if no messages are loaded yet.
   * This supports "new chat" pages where no conversation-turn nodes are present initially.
   *
   * @returns {Promise<Element>} Resolves with the container element.
   */
  private waitForContainer() {
    return new Promise((resolve) => {
      /**
       * Tries to locate the chat container using known selectors.
       * If found, resolves immediately.
       */
      const tryFind = () => {
        const container = getChatContainer();
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

      setTimeout(() => observer.disconnect(), 30000); // Stop after 30 seconds
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  private initVirtualiser() {
    this.waitForContainer()
      .then(() => {
        Logger.debug("Virtualiser", "Initialising...");
        // Create virtual chat manager
        this.virtualChatManager = new VirtualChatManager();
        this.virtualChatManager.rebuildMessageCache();
        this.virtualChatManager.scrollWindowToBottom();
        Logger.debug("Virtualiser", "Created Virtual Chat Manager");

        // Create scroll system
        this.scrollButton = new ScrollButton(this.virtualChatManager);
        this.scrollManager = new ScrollManager(
          this.virtualChatManager,
          this.scrollButton
        );

        this.scrollButton.setScrollManager(this.scrollManager);
        this.scrollButton.init();
        Logger.debug("Virtualiser", "Created Scroll Manager");

        // Create mutation watcher
        this.mutationWatcher = new MutationWatcher(
          this.virtualChatManager as VirtualChatManager
        );
        this.mutationWatcher.start();
        this.lifeCycleManager?.register(() => this.mutationWatcher?.stop());
        Logger.debug("Virtualiser", "Created Mutation Watcher");

        OverlayUI.getInstance().updateStats(
          (this.virtualChatManager as VirtualChatManager).getStats()
        );
        OverlayUI.getInstance().updateStats(
          (this.scrollManager as ScrollManager).getStats()
        );

        Logger.debug("Virtualiser", "Initialisation succeeded.");
      })
      .catch((err) => {
        Logger.error("Virtualiser", `Initialisation failed: ${err}`);
      });
  }

  public resetVirtualiser() {
    this.lifeCycleManager?.cleanupAll();
    this.initVirtualiser();
  }

  public toggleOverlay() {
    const overlay = OverlayUI.getInstance();
    overlay.updateStats(
      (this.virtualChatManager as VirtualChatManager).getStats()
    );
    overlay.updateStats((this.scrollManager as ScrollManager).getStats());
    overlay.toggle();
  }

  public destroy() {
    this.lifeCycleManager?.cleanupAll();
  }
}
