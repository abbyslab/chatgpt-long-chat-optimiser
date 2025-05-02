/**
 * Singleton class to track and manage debug statistics.
 */
export default class DebugStatistics {
  public static instance: DebugStatistics | null = null;
  public turnsIndexLow = 0;
  public turnsIndexHigh = 0;
  public turnsVisible = 0;
  public turnsTotal = 0;
  public scrollTop: number | null = null;
  public clientHeight: number | null = null;
  public scrollHeight: number | null = null;

  private constructor() {}

  /**
   * Retrieves or creates the singleton instance.
   */
  public static getInstance(): DebugStatistics {
    return DebugStatistics.instance ??= new DebugStatistics();
  }

  /**
   * Updates the statistics with provided data.
   * @param stats - Partial properties to update.
   */
  public update(stats: Partial<DebugStatistics>) {
    Object.assign(this, stats);
  }

  /**
   * Converts statistics to a string representation.
   */
  public toString(): string {
    return Object.entries(this)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }
}
