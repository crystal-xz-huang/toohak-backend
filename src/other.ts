import { getData, setData } from './dataStore';

/**
  * Reset the state of the application back to the start
  *
  * @param {} - no parameters
  * @returns {} - returns nothing
*/
export function clear(): Record<string, never> {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.userId_counter = 0;
  data.quizId_counter = 0;
  setData(data);
  return {};
}
