import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { Action, State } from './dataTypes';
import {
  EmptyObject,
  AdminQuizSessionListReturn,
  AdminQuizSessionStartReturn,
  AdminQuizSessionStatusReturn,
  AdminQuizSessionResultsReturn,
  AdminQuizSessionResultsCSVReturn
} from './functionTypes';
import {
  findUserbyToken,
  generateRandomNumber,
  isValidQuizIdForUser,
  isValidToken
} from './functionHelpers';

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 *
 * @param { string } token
 * @param { number } quizId
 * @returns { AdminQuizSessionListReturn } - an object containing the active and inactive session ids
 */
export function adminQuizSessionList(token: string, quizId: number): AdminQuizSessionListReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError);
  }

  const user = findUserbyToken(token, data);
  const userError = isValidQuizIdForUser(user.authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError);
  }

  const activeSessions = data.quizSessions
    .filter((s) => s.metadata.quizId === quizId && s.state !== State.END)
    .map((s) => s.sessionId)
    .sort((a, b) => a - b);

  const inactiveSessions = data.quizSessions
    .filter((s) => s.metadata.quizId === quizId && s.state === State.END)
    .map((s) => s.sessionId)
    .sort((a, b) => a - b);

  return { activeSessions, inactiveSessions };
}

/**
 * Starts a new session for a quiz
 * This copies the quiz, so that any edits whilst a session is running does not affect active session
 * If autostart number is 0, then no auto start will occur
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } autoStartNum - number of people to autostart the quiz once that number of people have joined
 * @returns { AdminQuizSessionStartReturn } - the session ID of the new session
 */
export function adminQuizSessionStart(token: string, quizId: number, autoStartNum: number): AdminQuizSessionStartReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError);
  }

  const user = findUserbyToken(token, data);
  const userError = isValidQuizIdForUser(user.authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError);
  }

  if (autoStartNum < 0 || autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum must be a number between 0 and 50');
  }

  const quiz = data.quizzes.find((q) => q.quizId === quizId && q.authUserId === user.authUserId);
  if (!quiz || !quiz.valid) {
    throw HTTPError(400, 'Quiz is in the trash');
  } else if (quiz.numQuestions === 0) {
    throw HTTPError(400, 'Quiz does not have any questions');
  }

  const sessions = data.quizSessions.filter((s) => s.metadata.quizId === quizId && s.state !== State.END);
  if (sessions.length >= 10) {
    throw HTTPError(400, 'A maximum of 10 sessions that are not in END state currently exist for this quiz');
  }

  const quizCopy = { ...quiz };
  delete quizCopy.authUserId;
  delete quizCopy.valid;

  const newSessionId = generateRandomNumber();
  data.quizSessions.push({
    sessionId: newSessionId,
    autoStartNum: autoStartNum,
    state: State.LOBBY,
    atQuestion: 0,
    metadata: quizCopy,
    questionCountDown: null,
    questionDuration: null,
  });
  setData(data);
  return { sessionId: newSessionId };
}

/**
 * Update the state of a particular quiz session by sending an action command
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } sessionId
 * @param { string } action - the action to perform
 * @returns { EmptyObject }
 */
export function adminQuizSessionUpdate(token: string, quizId: number, sessionId: number, action: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError);
  }

  const user = findUserbyToken(token, data);
  const userError = isValidQuizIdForUser(user.authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError);
  }

  const session = data.quizSessions.find((s) => s.sessionId === sessionId && s.metadata.quizId === quizId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  if (!Object.values(Action).includes(action as Action)) {
    throw HTTPError(400, 'Action provided is not a valid Action enum');
  }

  const questions = session.metadata.questions;
  if (action === Action.NEXT_QUESTION) {
    // only valid in LOBBY, QUESTION_CLOSE and ANSWER_SHOW
    if (![State.LOBBY, State.QUESTION_CLOSE, State.ANSWER_SHOW].includes(session.state as State)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }

    if (session.atQuestion >= questions.length) {
      throw HTTPError(400, 'Cannot move to the next question as there are no more questions');
    }

    session.atQuestion++;
    session.state = State.QUESTION_COUNTDOWN;
    const question = questions[session.atQuestion - 1];
    setData(data);
    session.questionCountDown = setTimeout(() => {
      session.state = State.QUESTION_OPEN;
      setData(data);
      session.questionDuration = setTimeout(() => {
        session.state = State.QUESTION_CLOSE;
        setData(data);
      }, question.duration * 1000);
    }, 3 * 1000);
  } else if (action === Action.SKIP_COUNTDOWN) {
    // only valid in QUESTION_COUNTDOWN
    if (session.state !== State.QUESTION_COUNTDOWN) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }

    clearTimeout(session.questionCountDown);
    clearTimeout(session.questionDuration);
    session.questionCountDown = null;
    session.questionDuration = null;
    session.state = State.QUESTION_OPEN;
    setData(data);
    session.questionDuration = setTimeout(() => {
      session.state = State.QUESTION_CLOSE;
      setData(data);
    }, questions[session.atQuestion - 1].duration * 1000);
  } else if (action === Action.GO_TO_ANSWER) {
    // only valid in QUESTION_OPEN and QUESTION_CLOSE
    if (![State.QUESTION_OPEN, State.QUESTION_CLOSE].includes(session.state as State)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }
    clearTimeout(session.questionDuration);
    session.questionDuration = null;
    session.state = State.ANSWER_SHOW;
    setData(data);
  } else if (action === Action.GO_TO_FINAL_RESULTS) {
    // only valid in ANSWER_SHOW and QUESTION_CLOSE
    if (![State.ANSWER_SHOW, State.QUESTION_CLOSE].includes(session.state)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }
    session.state = State.FINAL_RESULTS;
    setData(data);
  } else if (action === Action.END) {
    // valid in all states except END itself
    if (session.state === State.END) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }
    clearTimeout(session.questionCountDown);
    clearTimeout(session.questionDuration);
    session.questionCountDown = null;
    session.questionDuration = null;
    session.state = State.END;
    setData(data);
  }
  return {};
}

/**
 * Get the status of a particular quiz session
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } sessionId
 * @returns { AdminQuizSessionStatusReturn } - an object containing the status of the quiz session
 */
export function adminQuizSessionStatus(token: string, quizId: number, sessionId: number): AdminQuizSessionStatusReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError);
  }

  const user = findUserbyToken(token, data);
  const userError = isValidQuizIdForUser(user.authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError);
  }

  const session = data.quizSessions.find((s) => s.sessionId === sessionId && s.metadata.quizId === quizId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session within this quiz');
  }

  // find the players in the session
  const players = data.players
    .filter((p) => p.sessionId === sessionId)
    .map((p) => p.name);

  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: players,
    metadata: session.metadata
  };
}

/**
 * Get the final results for all players for a completed quiz session
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } sessionId
 * @returns { AdminQuizSessionResultsReturn } - an object containing the results of the quiz session
 */
export function adminQuizSessionResults(token: string, quizId: number, sessionId: number): AdminQuizSessionResultsReturn {
  return {
    usersRankedByScore: [
      { name: 'Hayden', score: 45 }
    ],
    questionResults: [
      {
        questionId: 5546,
        playersCorrectList: ['Hayden'],
        averageAnswerTime: 45,
        percentCorrect: 54
      }
    ]
  };
}

/**
 * Get the a link to the final results (in CSV format) for all players for a completed quiz session
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } sessionId
 * @returns { AdminQuizSessionResultsCSVReturn } - an object containing the URL to the CSV file
 */
export function adminQuizSessionResultsCSV(token: string, quizId: number, sessionId: number): AdminQuizSessionResultsCSVReturn {
  return { url: 'http://google.com/some/image/path.csv' };
}
