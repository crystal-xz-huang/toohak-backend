import { getData, setData } from './dataStore';

/**
  * Reset the state of the application back to the start.
  * 
  * @param { } - has no parameters
  * @returns { } - returns nothing
*/
export function clear() {
  let data = getData();
  data.users = [];
  data.quizzes = []; 
  setData(data);
  return {};
}