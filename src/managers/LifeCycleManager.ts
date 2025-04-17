export default class LifecycleManager {
  private cleanupFns: Array<() => void>;

  constructor() {
    this.cleanupFns = [];
  }

  register(fn: () => void): void {
    this.cleanupFns.push(fn);
  }

  cleanupAll(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }
}
