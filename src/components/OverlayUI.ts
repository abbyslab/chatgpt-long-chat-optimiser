import CONFIG from "@config/config";
import { IDS } from "@config/constants";
import DebugStatistics from "@utils/DebugStatistics";
import { Logger } from "@utils/utils";
import "@styles/debugOverlay.css";

/**
 * Manages the debug overlay that displays runtime statistics.
 */
export default class OverlayUI {
  /** Singleton instance of OverlayUI */
  private static instance: OverlayUI | null;

  /** Container element that hosts the shadow DOM */
  private readonly shadowHost: HTMLElement;

  /** Mount point for the overlay content within shadow DOM */
  private readonly mountPoint: HTMLElement | null;

  /** Local storage key for overlay visibility state */
  private cacheKey: string;

  /**
   * Initialises the overlay UI with default values and visibility settings.
   */
  private constructor() {
    this.shadowHost = document.createElement("div")
    this.shadowHost.id = IDS.DEBUG_OVERLAY;
    this.mountPoint = document.createElement("div");
    this.mountPoint.id = IDS.MOUNT_POINT;
    document.body.appendChild(this.shadowHost);
    this.shadowHost.attachShadow({ mode: "open" }).appendChild(this.mountPoint);

    this.cacheKey = "overlayVisible";

    /* Set initial visibility
     *  If nothing in cache -> check config
     */
    if (!this.isCacheSet()) {
      this.setCachedVisibility(CONFIG.OVERLAY_ENABLED);
    }
    this.enforceCachedVisibility();

    Logger.debug("OverlayUI", "Debug overlay initialised.");
  }

  /**
   * Returns the singleton instance of OverlayUI.
   * @returns {OverlayUI} The singleton instance of OverlayUI
   */
  public static getInstance(): OverlayUI {
    return OverlayUI.instance ??= new OverlayUI();
  }

  /**
   * Checks if visibility state is set in local storage.
   * @private
   * @returns {boolean} True if the cache value exists
   */
  private isCacheSet(): boolean {
    return localStorage.getItem(this.cacheKey) !== null;
  }

  /**
   * Gets the visibility state from local storage.
   * @private
   * @returns {boolean} True if the overlay should be visible
   */
  private isCachedVisible(): boolean {
    return localStorage.getItem(this.cacheKey) === "true";
  }

  /**
   * Sets the visibility state in local storage.
   * @private
   * @param {boolean} isVisible - Whether the overlay should be visible
   */
  private setCachedVisibility(isVisible: boolean): void {
    localStorage.setItem(this.cacheKey, isVisible ? "true" : "false");
  }

  /**
   * Updates the overlay content with the provided statistics.
   * @param {Record<string, any>} obj - Contains statistics data like visible, total, scrollTop, etc.
   */
  public updateStats(obj: Record<string, any>): void {
    DebugStatistics.getInstance().update(obj);

    // Update overlay HTMLElement
    if (!this.mountPoint) return;
    this.mountPoint.innerText =
      DebugStatistics.getInstance().turnsTotal === 0
        ? "Waiting for messages..."
        : DebugStatistics.getInstance().toString();

    this.enforceCachedVisibility();
  }

  /**
   * Enforces visibility of the overlay based on cached state.
   * @private
   */
  private enforceCachedVisibility(): void {
    if (!this.shadowHost) return;
    this.shadowHost.style.display = this.isCachedVisible() ? "block" : "none";
  }

  /**
   * Toggles the overlay's visibility.
   */
  public toggle(): void {
    this.setCachedVisibility(!this.isCachedVisible());
    this.enforceCachedVisibility();
    Logger.debug("OverlayUI", `Visibility toggled: ${this.isCachedVisible()}`);
  }
}
