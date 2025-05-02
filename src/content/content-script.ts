import ACTIONS from "@config/actions";
import LifecycleManager from "@managers/LifeCycleManager";
import Virtualiser from "@managers/Virtualiser";
import { Logger } from "@utils/utils";

/**
 * Content script entry point for the ChatGPT Long Chat Optimiser extension.
 * Handles initialisation, URL change detection, and message handling.
 */

Logger.debug(
  "ChatGPT Long Chat Optimiser",
  `Loaded v${chrome.runtime.getManifest().version}`
);

const lifeCycleManager: LifecycleManager = new LifecycleManager();
const virtualiser: Virtualiser = new Virtualiser();
lifeCycleManager?.register((): void => {
  virtualiser.destroy();
});

let currentUrl: string = window.location.href;

/**
 * Watches for URL changes and reinitialises the virtualiser when needed.
 * This ensures the extension works correctly when navigating between chats.
 */
const checkURL = (): void => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    Logger.debug("content-script", "URL changed. Reinitialising.");
    virtualiser.resetVirtualiser();
  }
};

// Periodically check - catches pushstate and replacestate
const id: number = window.setInterval(checkURL, 1000);
lifeCycleManager?.register((): void => {
  window.clearInterval(id);
});

// Also listen to popstate (back/forward buttons)
window.addEventListener("popstate", checkURL);
lifeCycleManager?.register((): void => {
  window.removeEventListener("popstate", checkURL);
});

/**
 * Handles incoming messages from the extension's background script or popup.
 * 
 * @param request - The message request object
 * @param _sender - Information about the sender of the message
 * @param sendResponse - Function to call to send a response
 * @returns boolean - True to indicate async response handling
 */
function handleMessages(
  request: { action: string; [key: string]: any },
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: { ok: boolean }) => void
): boolean {
  Logger.debug("content-script", "Message received:", request.action);

  if (request.action === ACTIONS.TOGGLE_DEBUG_OVERLAY) {
    virtualiser.toggleOverlay();
    sendResponse({ ok: true });
  } else {
    sendResponse({ ok: false });
  }
  return true;
}

// Setup message handler for toggling the debug overlay
chrome.runtime.onMessage.addListener(handleMessages);
lifeCycleManager?.register((): void => {
  chrome.runtime.onMessage.removeListener(handleMessages);
});
