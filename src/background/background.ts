import { ACTIONS } from "@config/actions";
import LifecycleManager from "@managers/LifeCycleManager";
import { Logger } from "@utils/utils";

const lifeCycleManager: LifecycleManager = new LifecycleManager();

/**
 * Command handlers for the background service worker.
 */
async function toggleDebugOverlay() {
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
    (_response: any): void => {
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

// Listen for commands and dispatch to the appropriate handler.
const commandHandler = (command: string): void => {
  if (command === ACTIONS.TOGGLE_DEBUG_OVERLAY) {
    Logger.debug("Background", `Executing: ${ACTIONS.TOGGLE_DEBUG_OVERLAY}`);
    toggleDebugOverlay();
  } else {
    Logger.debug("Background", `Command unknown: ${command}`);
  }
};

chrome.commands.onCommand.addListener(commandHandler);
lifeCycleManager.register(() => {
  chrome.commands.onCommand.removeListener(commandHandler);
});
