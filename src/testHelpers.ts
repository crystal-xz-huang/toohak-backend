/**
 * Helper functions for testing
*/

import { PlayerQuestionInfoReturn, AdminQuizInfoReturn } from './functionTypes';

export const getTimeStamp = () => Math.floor(Date.now() / 1000);

export function checkTimeStamp(timeStamp: number, expectedTimeStamp: number) {
  // allow for 1 second offset
  expect(timeStamp).toBeGreaterThanOrEqual(expectedTimeStamp - 1);
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

// Sort an array of numbers in ascending order
export function sortNumericArray(arr: number[]): number[] {
  return arr.sort((a, b) => a - b);
}

export function sortStringArray(arr: string[]): string[] {
  return arr.sort();
}

export function getQuestionAnswerIds(question: PlayerQuestionInfoReturn): number[] {
  return question.answers.map((answer) => answer.answerId);
}

export function getAnswerIds(quizInfo: AdminQuizInfoReturn, questionId: number): number[] {
  return quizInfo.questions
    .find((question) => question.questionId === questionId)
    .answers.map((answer) => answer.answerId);
}
