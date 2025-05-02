import OverlayUI from "@components/OverlayUI";
import { SELECTORS } from "@config/constants";
import VirtualChatManager from "@managers/VirtualChatManager";
import { Logger } from "@utils/utils";

/**
 * Observes DOM mutations to detect new chat message nodes.
 */
export default class MutationWatcher {
  private chatManager: VirtualChatManager;
  private observer: MutationObserver | null;

  /**
   * Creates a new instance of MutationWatcher.
   * @param chatManager - Instance of VirtualChatManager
   * @param overlayUI - Instance of OverlayUI or null
   */
  public constructor(chatManager: VirtualChatManager) {
    this.chatManager = chatManager;
    this.observer = null;
  }

  /**
   * Starts observing the document for new message nodes.
   * Throws an error if no chatManager is provided.
   * @returns void
   */
  public start(): void {
    if (!this.chatManager) {
      throw new Error("MutationWatcher: chatManager is required.");
    }

    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.observer.observe(document.body, { childList: true, subtree: true });
    Logger.debug("MutationWatcher", "Observer started.");
  }

  /**
   * Handles DOM mutations by checking for new message nodes.
   * If new nodes are detected, the message cache is rebuilt.
   * @param mutations - Array of mutation records.
   * @returns void
   */
  public handleMutations(mutations: MutationRecord[]): void {
    let newMessagesFound: boolean = false;
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        const el: HTMLElement = node as HTMLElement;
      
        if (!el.matches?.(SELECTORS.CONVERSATION_TURN)) continue;
      
        // If node is a message -> add it
        newMessagesFound ||= this.chatManager.addNewNode(el);
      }
    }

    if (newMessagesFound) {
      Logger.debug(
        "MutationWatcher",
        "New messages detected. Rebuilding cache."
      );
      this.chatManager.rebuildMessageCache();
      this.chatManager.scrollWindowToBottom();
      
      OverlayUI.getInstance().updateStats(this.chatManager.getStats());
    }
  }

  /**
   * Stops observing DOM mutations.
   * @returns void
   */
  public stop(): void {
    this.observer?.disconnect();
    Logger.debug("MutationWatcher", "Observer stopped.");
  }
}
