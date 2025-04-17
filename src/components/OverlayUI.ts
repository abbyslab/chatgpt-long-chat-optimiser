import CONFIG from "@config/config";
import { IDS } from "@config/constants";
import Statistics from "@utils/Statistics";
import { Logger } from "@utils/utils";

/**
 * Manages the debug overlay that displays runtime statistics.
 */
export default class OverlayUI {
  overlayHTMLElement: HTMLElement | null;
  cacheKey: string;
  stats: Statistics;

  constructor() {
    this.overlayHTMLElement = null;
    this.cacheKey = "overlayVisible";
    this.stats = new Statistics();

    // Create HTMLElement for overlay if one doesn't exist
    const existing = document.getElementById(IDS.DEBUG_OVERLAY);
    if (existing) {
      this.overlayHTMLElement = existing;
    } else {
      this.overlayHTMLElement = document.createElement("div");
      this.overlayHTMLElement.id = IDS.DEBUG_OVERLAY;
      Object.assign(this.overlayHTMLElement.style, {
        position: "fixed",
        top: "10px",
        left: "10px",
        zIndex: "2147483647",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "8px 12px",
        fontSize: "14px",
        fontFamily: "monospace",
        borderRadius: "4px",
        pointerEvents: "none",
        whiteSpace: "pre-line",
      });

      document.body.appendChild(this.overlayHTMLElement);
    }

    /* Set initial visibility
     *  If nothing in cache -> check config
     */
    if (!this.#isCacheSet()) {
      this.#setCachedVisibility(CONFIG.OVERLAY_ENABLED);
    }
    this.#enforceVisibility();

    Logger.debug("OverlayUI", "Debug overlay initialised.");
  }

  #isCacheSet(): boolean {
    return localStorage.getItem(this.cacheKey) !== null;
  }

  #isCachedVisible(): boolean {
    return localStorage.getItem(this.cacheKey) === "true";
  }

  #setCachedVisibility(isVisible: boolean): void {
    localStorage.setItem(this.cacheKey, isVisible ? "true" : "false");
  }

  #cacheUnset(): void {
    localStorage.removeItem(this.cacheKey);
  }

  /**
   * Updates the overlay content with the provided statistics.
   * @param {Object} stats - Contains visible, total, scrollTop, clientHeight, and scrollHeight.
   */
  updateStats(obj: Object) {
    this.stats.update(obj);

    // Update overlay HTMLElement
    if (!this.overlayHTMLElement) return;
    this.overlayHTMLElement.innerText =
      this.stats.turnsTotal === 0
        ? "Waiting for messages..."
        : this.stats.toString();

    this.#enforceVisibility();
  }

  #enforceVisibility() {
    if (!this.overlayHTMLElement) return;
    this.overlayHTMLElement.style.display = this.#isCachedVisible()
      ? "block"
      : "none";
  }

  /**
   * Toggles the overlay's visibility.
   */
  toggle() {
    this.#setCachedVisibility(!this.#isCachedVisible());
    this.#enforceVisibility();
    Logger.debug("OverlayUI", `Visibility toggled: ${this.#isCachedVisible()}`);
  }

  destroy() {
    if (this.overlayHTMLElement)
      document.body.removeChild(this.overlayHTMLElement);
    this.#cacheUnset();
  }
}
