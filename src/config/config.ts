/**
 * Configuration settings for ChatGPT Long Chat Optimiser.
 */
export const CONFIG = {
  KEEP_RECENT: 50, // Maximum number of recent messages to keep visible
  CHUNK_SIZE: 20, // Number of messages to load when scrolling up
  TOP_THRESHOLD: 300, // Pixel threshold from the top to trigger loading older messages
  DYNAMIC_BOTTOM_RATIO: 0.05, // Percentage of container height used to determine scroll button visibility
  REINIT_DELAY: 1000, // Delay (in milliseconds) before reinitialising after a DOM mutation

  DEBUG: true, // Enable debug logging and overlay
  OVERLAY_ENABLED: true, // Start with the debug overlay visible
};

export default CONFIG;
