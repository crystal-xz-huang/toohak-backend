import { getData, setData } from './dataStore';
import { EmptyObject } from './functionTypes';
import { clearAllTimers } from './timerStore';

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
  data.userSessions = [];
  data.quizSessions = [];
  data.players = [];
  data.messages = [];
  clearAllTimers();
  setData(data);
  return {};
}
