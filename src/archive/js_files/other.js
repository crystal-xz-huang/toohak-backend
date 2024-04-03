import { getData, setData } from './dataStore.js';

/**
  * Reset the state of the application back to the start.
  *
  * @param { } - has no parameters
  * @returns { } - returns nothing
*/
export function clear() {
  const dataStore = getData();
  dataStore.users = [];
  dataStore.quizzes = [];
  dataStore.userId_counter = 0;
  dataStore.quizId_counter = 0;
  setData(dataStore);
  return {};
}
