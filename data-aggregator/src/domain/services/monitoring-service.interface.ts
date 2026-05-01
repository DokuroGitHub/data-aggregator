export interface IMonitoringService {
  /**
   * Get the APM agent instance
   */
  getAgent(): any;

  /**
   * Check if APM is active
   */
  isActive(): boolean;

  /**
   * Start a custom transaction
   */
  startTransaction(name: string, type?: string): any;

  /**
   * Start a custom span
   */
  startSpan(name: string, type?: string): any;

  /**
   * Capture an error
   */
  captureError(error: Error, context?: any): void;

  /**
   * Add custom labels to current transaction
   */
  addLabels(labels: Record<string, string | number | boolean>): void;

  /**
   * Add user context to current transaction
   */
  setUserContext(user: { id?: string; username?: string; email?: string }): void;

  /**
   * Add custom context to current transaction
   */
  setCustomContext(context: Record<string, any>): void;

  /**
   * Flush APM data (useful for testing or shutdown)
   */
  flush(): Promise<void>;
}
