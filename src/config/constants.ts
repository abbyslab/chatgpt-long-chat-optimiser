/**
 * Version number for ChatGPT Long Chat Optimiser.
 */
export const VERSION = "0.1.0";

/**
 * DOM query selectors for locating elements within the ChatGPT interface.
 */
export const SELECTORS = {
  CONVERSATION_TURN: 'article[data-testid^="conversation-turn"]',
  SCROLL_BUTTON: 'button[data-testid="scroll-down-button"]',
  CHAT_CONTAINER: "main",
};

/**
 * Element IDs for the UI.
 */
export const IDS = {
  DEBUG_OVERLAY: "tm-debug-overlay",
  NATIVE_SCROLL_BUTTON: "tm-scroll-button",
  CUSTOM_SCROLL_BUTTON: "custom-scroll-button",
};
