import { ACTIONS } from "@config/actions";
import LifecycleManager from "@managers/LifeCycleManager";
import { Logger } from "@utils/utils";

/**
 * Instance of the lifecycle manager to handle cleanup on extension unload
 */
const lifeCycleManager: LifecycleManager = new LifecycleManager();

/**
 * Toggles the debug overlay on the active tab
 * Sends a message to the content script to toggle visibility
 * @returns {Promise<void>} A promise that resolves when the operation completes
 */
async function toggleDebugOverlay(): Promise<void> {
  // Obtain ID of current tab
  const tabId: number | undefined = (
    await chrome.tabs.query({ active: true, currentWindow: true })
  )[0]?.id;

  if (!tabId) {
    Logger.warn(
      "Background",
      "No active tab found to send debug overlay toggle."
    );
    return;
  }

  // Send a message to toggle the debug overlay.
  Logger.debug("Background", `Sending message to ${tabId}`);
  chrome.tabs.sendMessage(
    tabId,
    { action: ACTIONS.TOGGLE_DEBUG_OVERLAY },
    (_response: unknown): void => {
      Logger.debug("Background", "Received response");
      if (chrome.runtime.lastError) {
        Logger.error(
          "Background",
          "Failed to send message:",
          chrome.runtime.lastError?.message as string
        );
      } else {
        Logger.debug("Background", "Toggled debug overlay via message.");
      }
    }
  );
}

Logger.debug("Background", "Service worker loaded");

/**
 * Handles incoming commands from the extension
 * Dispatches to the appropriate handler based on the command type
 * @param {string} command - The command identifier
 * @returns {void}
 */
const commandHandler = (command: string): void => {
  if (command === ACTIONS.TOGGLE_DEBUG_OVERLAY) {
    Logger.debug("Background", `Executing: ${ACTIONS.TOGGLE_DEBUG_OVERLAY}`);
    toggleDebugOverlay();
  } else {
    Logger.debug("Background", `Command unknown: ${command}`);
  }
};

// Register command listener
chrome.commands.onCommand.addListener(commandHandler);

// Register cleanup function to remove listener when extension is unloaded
lifeCycleManager.register((): void => {
  chrome.commands.onCommand.removeListener(commandHandler);
});
