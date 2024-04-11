import { getData, setData } from './dataStore';
import { EmptyObject } from './functionTypes';

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
  data.quizSessions.forEach((session) => {
    clearTimeout(session.questionCountDown);
    clearTimeout(session.questionDuration);
    session.questionCountDown = null;
    session.questionDuration = null;
  });
  data.quizSessions = [];
  data.players = [];
  data.messages = [];
  setData(data);
  return {};
}
