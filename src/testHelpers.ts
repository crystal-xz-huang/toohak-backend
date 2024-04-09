/**
 * Helper functions for testing
*/

export const getTimeStamp = () => Math.floor(Date.now() / 1000);

export function checkTimeStamp(timeStamp: number, expectedTimeStamp: number) {
  // allow for 1 second offset
  expect(timeStamp).toBeGreaterThanOrEqual(expectedTimeStamp);
  expect(timeStamp).toBeLessThanOrEqual(expectedTimeStamp + 1);
}

// Function to block execution (i.e. sleep)
// Not ideal (inefficent/poor performance) and should not be used often.
//
// Alternatives include:
// - https://www.npmjs.com/package/atomic-sleep
// - or use async (not covered in this course!)
export function sleepSync(ms: number) {
  const startTime = new Date().getTime();
  while (new Date().getTime() - startTime < ms) {
    // zzzZZ - comment needed so eslint doesn't complain
  }
}
