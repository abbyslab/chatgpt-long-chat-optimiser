/**
 * DOM query selectors for locating elements within the ChatGPT interface.
 * These selectors are used to identify specific elements for manipulation or observation.
 */
export interface Selectors {
  /** Selector for conversation message blocks */
  CONVERSATION_TURN: string,
  /** Selector for the native scroll down button */
  SCROLL_BUTTON: string,
};

/**
 * Element IDs for the UI components used by the extension.
 */
export interface Ids {
  /** ID for the debug overlay element */
  DEBUG_OVERLAY: string,
  /** ID for the native scroll button when modified */
  NATIVE_SCROLL_BUTTON: string,
  /** ID for the custom scroll button element */
  CUSTOM_SCROLL_BUTTON: string,
  /** ID for the extension's mount point in the DOM */
  MOUNT_POINT: string
};

export const SELECTORS: Selectors = {
  CONVERSATION_TURN: 'article[data-testid^="conversation-turn"]',
  SCROLL_BUTTON: 'button[data-testid="scroll-down-button"]'
};

export const IDS: Ids = {
  DEBUG_OVERLAY: "tm-debug-overlay",
  NATIVE_SCROLL_BUTTON: "tm-scroll-button",
  CUSTOM_SCROLL_BUTTON: "custom-scroll-button",
  MOUNT_POINT: "mount-point"
};
