import { Logger } from "@utils/utils";

/**
 * Manages lifecycle cleanup functions for application resources.
 * Provides functionality to register and execute cleanup operations.
 */
export default class LifecycleManager {
  /**
   * Array of cleanup functions to be executed when cleanupAll is called
   */
  private cleanupFns: Array<() => void>;

  /**
   * Creates a new LifecycleManager instance with an empty cleanup functions array
   */
  public constructor() {
    this.cleanupFns = [];
  }

  /**
   * Registers a cleanup function to be executed later
   * @param fn - The cleanup function to register
   */
  public register(fn: () => void): void {
    this.cleanupFns.push(fn);
  }

  /**
   * Executes all registered cleanup functions and clears the array
   */
  public cleanupAll(): void {
    this.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        Logger.error("LifecycleManager", "Error during cleanup:", String(err));
      }
    });
    this.cleanupFns = [];
  }
}
