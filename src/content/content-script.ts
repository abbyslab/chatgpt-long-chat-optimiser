import ACTIONS from "@config/actions";
import { VERSION } from "@config/constants";
import LifecycleManager from "@managers/LifeCycleManager";
import Virtualiser from "@managers/Virtualiser";
import { Logger } from "@utils/utils";

Logger.debug("ChatGPT Long Chat Optimiser", `Loaded v${VERSION}`);

const lifeCycleManager: LifecycleManager = new LifecycleManager();
const virtualiser: Virtualiser = new Virtualiser();
lifeCycleManager?.register(() => {
  virtualiser.destroy();
});

let currentUrl = window.location.href;

/**
 * Watches for URL changes and reinitialises the virtualiser when needed.
 */
const checkURL = () => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    Logger.debug("content-script", "URL changed. Reinitialising.");
    virtualiser.resetVirtualiser();
  }
};

// Periodically check - catches pushstate and replacestate
const id = setInterval(checkURL, 1000);
lifeCycleManager?.register(() => {
  clearInterval(id);
});

// Also listen to popstate (back/forward buttons)
window.addEventListener("popstate", checkURL);
lifeCycleManager?.register(() => {
  window.removeEventListener("popstate", checkURL);
});

function handleMessages(
  request: any,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void
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
lifeCycleManager?.register(() => {
  chrome.runtime.onMessage.removeListener(handleMessages);
});
