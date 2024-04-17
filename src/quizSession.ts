import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import { clearTimer, setTimer, TimerState } from './timerStore';
import { Action, State } from './dataTypes';
import {
  EmptyObject,
  AdminQuizSessionListReturn,
  AdminQuizSessionStartReturn,
  AdminQuizSessionStatusReturn,
  AdminQuizSessionResultsReturn,
  AdminQuizSessionResultsCSVReturn,
  PlayerQuestionResultsReturn,
} from './functionTypes';
import {
  findUserbyToken,
  generateRandomNumber,
  isValidQuizIdForUser,
  isValidToken,
  getCurrentTime,
  copyQuizToQuizMetadata,
  convertSessionMetadata,
  getPlayerTotalScore,
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

  const newSessionId = generateRandomNumber();
  data.quizSessions.push({
    sessionId: newSessionId,
    autoStartNum: autoStartNum,
    state: State.LOBBY,
    atQuestion: 0,
    metadata: copyQuizToQuizMetadata(quiz)
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
  const questionCount = questions.length;

  // If the quiz is in either LOBBY, FINAL_RESULTS, or END state then at Question should be 0
  if (action === Action.NEXT_QUESTION) {
    // only valid in LOBBY, QUESTION_CLOSE and ANSWER_SHOW states
    if (![State.LOBBY, State.QUESTION_CLOSE, State.ANSWER_SHOW].includes(session.state as State)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }

    if (session.atQuestion === questionCount) {
      throw HTTPError(400, 'Already at the last question');
    }

    session.atQuestion = session.atQuestion + 1;
    clearTimer(session.sessionId, TimerState.questionCountDown);
    clearTimer(session.sessionId, TimerState.questionDuration);
    session.state = State.QUESTION_COUNTDOWN;
    const question = questions[session.atQuestion - 1];
    setData(data);
    // set the countdown timer to open the question after 3 seconds
    setTimer(session.sessionId, TimerState.questionCountDown, 3, () => {
      session.state = State.QUESTION_OPEN;
      question.timeOpen = getCurrentTime();
      setData(data);
      // set the duration timer to close the question after the question duration
      setTimer(session.sessionId, TimerState.questionDuration, question.duration, () => {
        session.state = State.QUESTION_CLOSE;
        setData(data);
      });
    });
  } else if (action === Action.SKIP_COUNTDOWN) {
    // only valid in QUESTION_COUNTDOWN
    if (session.state !== State.QUESTION_COUNTDOWN) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }

    // clear the countdown timer and open the question immediately
    clearTimer(session.sessionId, TimerState.questionCountDown);
    clearTimer(session.sessionId, TimerState.questionDuration);

    // set the duration timer to close the question after the question duration
    const question = questions[session.atQuestion - 1];
    session.state = State.QUESTION_OPEN;
    question.timeOpen = getCurrentTime();
    setTimer(session.sessionId, TimerState.questionDuration, question.duration, () => {
      session.state = State.QUESTION_CLOSE;
      setData(data);
    });
  } else if (action === Action.GO_TO_ANSWER) {
    // only valid in QUESTION_OPEN and QUESTION_CLOSE
    if (![State.QUESTION_OPEN, State.QUESTION_CLOSE].includes(session.state as State)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }

    // clear the duration timer and show the answer immediately
    clearTimer(session.sessionId, TimerState.questionDuration);
    session.state = State.ANSWER_SHOW;
  } else if (action === Action.GO_TO_FINAL_RESULTS) {
    // only valid in ANSWER_SHOW and QUESTION_CLOSE
    if (![State.ANSWER_SHOW, State.QUESTION_CLOSE].includes(session.state)) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }
    session.state = State.FINAL_RESULTS;
    session.atQuestion = 0;
  } else if (action === Action.END) {
    // valid in all states except END itself
    if (session.state === State.END) {
      throw HTTPError(400, `Action ${action} cannot be applied in the current ${session.state} state`);
    }
    // clear all timers and end the session
    clearTimer(session.sessionId, TimerState.questionCountDown);
    clearTimer(session.sessionId, TimerState.questionDuration);
    session.atQuestion = 0;
    session.state = State.END;
  }

  setData(data);
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

  // find the players in the session and sort in ascending order of name
  const players = data.players
    .filter((p) => p.sessionId === sessionId)
    .map((p) => p.name)
    .sort();

  return {
    state: session.state,
    atQuestion: session.atQuestion,
    players: players,
    metadata: convertSessionMetadata(session.metadata)
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

  // check if the session is in the FINAL_RESULTS state
  if (session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'The session is not in the FINAL_RESULTS state');
  }

  // calculate the total score for each player in the session
  const players = data.players.filter((p) => p.sessionId === sessionId);
  players.forEach((p) => {
    const totalScore = getPlayerTotalScore(p.playerId, session.metadata.questions);
    p.score = Math.round(totalScore);
    setData(data);
  });

  // Rank users by score in descending order
  const usersRankedByScore = players
    .sort((a, b) => b.score - a.score)
    .map((p) => ({
      name: p.name,
      score: p.score,
    }));

  const questions = session.metadata.questions;
  const questionResults: PlayerQuestionResultsReturn[] = questions.map((q) => {
    const totalTime = q.playerAnswers.reduce((acc, a) => acc + a.answerTime, 0);
    const averageTime = Math.round(totalTime / q.playerAnswers.length);
    const totalCorrect = q.playerCorrectList.length;
    const totalPlayers = data.players.filter((p) => p.sessionId === sessionId).length;
    const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);
    return {
      questionId: q.questionId,
      playersCorrectList: q.playerCorrectList.map((p) => p.name).sort(),
      averageAnswerTime: averageTime || 0,
      percentCorrect: percentCorrect
    };
  });

  return { usersRankedByScore, questionResults };
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
