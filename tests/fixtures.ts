import { test as base } from '@playwright/test';

/**
 * Worker-scoped fixture that provides a unique worker ID
 * Used for generating unique test data to avoid conflicts in parallel execution
 */
type WorkerFixtures = {
  workerId: string;
};

export const test = base.extend<{}, WorkerFixtures>({
  workerId: [
    async ({}, use, testInfo) => {
      await use(`w${testInfo.parallelIndex}`);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
