import { getData, setData } from './dataStore';
import { EmptyObject } from './types';

/**
  * Reset the state of the application back to the start
  *
  * @param {} - no parameters
  * @returns {EmptyObject} - returns nothing
*/
export function clear(): EmptyObject {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.userId_counter = 0;
  data.quizId_counter = 0;
  setData(data);
  return {};
}
