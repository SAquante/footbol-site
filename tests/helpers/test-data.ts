/**
 * Test Data Factory
 * Generates unique test data for each worker to avoid conflicts in parallel execution
 */
export class TestDataFactory {
  constructor(private workerId: string) {}
  
  /**
   * Generate unique email address for testing
   * @returns Email in format: user-{workerId}-{timestamp}@test.com
   */
  generateEmail(): string {
    return `user-${this.workerId}-${Date.now()}@test.com`;
  }
  
  /**
   * Generate unique username for testing
   * @returns Username in format: user-{workerId}-{timestamp}
   */
  generateUsername(): string {
    return `user-${this.workerId}-${Date.now()}`;
  }
  
  /**
   * Generate secure password for testing
   * @returns Password in format: Pass{workerId}{timestamp}!
   */
  generatePassword(): string {
    return `Pass${this.workerId}${Date.now()}!`;
  }
  
  /**
   * Generate unique match location for testing
   * @returns Location in format: Test Stadium {workerId}
   */
  generateMatchLocation(): string {
    return `Test Stadium ${this.workerId}`;
  }
  
  /**
   * Generate unique match date (future date)
   * @returns ISO date string for a future date
   */
  generateMatchDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 10 + parseInt(this.workerId.replace('w', ''), 10));
    return date.toISOString();
  }
}
