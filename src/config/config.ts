/**
 * Configuration settings for ChatGPT Long Chat Optimiser.
 * Contains parameters that control the chat loading behavior and debug settings.
 */
export interface ConfigSettings {
  /** Number of messages to keep loaded */
  WINDOW_SIZE: number;
  
  /** Pixel threshold from the top to trigger loading older messages */
  TOP_THRESHOLD: number;
  
  /** Pixel threshold from the bottom to trigger loading newer messages */
  BOTTOM_THRESHOLD: number;

  /** Percentage of container height used to determine scroll button visibility */
  DYNAMIC_BOTTOM_RATIO: number;
  
  /** Delay (in milliseconds) before reinitialising after a DOM mutation */
  REINIT_DELAY: number;

  /** Minimum delay (in milliseconds) between window scroll actions */
  SCROLL_COOLDOWN_MS: number;
  
  /** Enable debug logging and overlay */
  DEBUG: boolean;
  
  /** Start with the debug overlay visible */
  OVERLAY_ENABLED: boolean;
}

export const CONFIG: ConfigSettings = {
  WINDOW_SIZE: 20,
  TOP_THRESHOLD: 500,
  BOTTOM_THRESHOLD: 500,
  DYNAMIC_BOTTOM_RATIO: 0.05,
  REINIT_DELAY: 1000,

  SCROLL_COOLDOWN_MS: 100,
  
  DEBUG: true,
  OVERLAY_ENABLED: true,
};

export default CONFIG;
