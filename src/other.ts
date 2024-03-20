import { getData, setData } from './dataStore';
import { EmptyObject } from './dataTypes';

/**
  * Reset the state of the application back to the start
  *
  * @param { void }
  * @returns { EmptyObject }
*/
export function clear(): EmptyObject {
  const data = getData();
  data.users = [];
  data.quizzes = [];
  data.sessions = [];
  data.userId_counter = 0;
  data.quizId_counter = 0;
  data.sessionId_counter = 0;
  setData(data);
  return {};
}
