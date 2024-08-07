import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  State,
} from './dataTypes';
import {
  EmptyObject,
  ChatMessage,
  PlayerJoinReturn,
  PlayerStatusReturn,
  PlayerQuestionInfoReturn,
  PlayerQuestionResultsReturn,
  PlayerFinalResultsReturn,
  PlayerChatListReturn,
} from './functionTypes';

import {
  generateRandomNumber,
  generateRandomStringPlayer,
  isPlayerNameUsed,
  getCurrentTime,
  getPlayerTotalScore,
} from './functionHelpers';

/**
 * Allows a guest player to join a session
 *
 * @param { number } sessionId - the session ID to check
 * @param { string } name - the name of the player
 * @returns { PlayerJoinReturn } - an object containing the player ID
 * @throws { HTTPError } - throws an HTTP 400 error if the session ID is invalid
*/
export function playerJoin(sessionId: number, name: string): PlayerJoinReturn {
  const data = getData();

  const nameError = isPlayerNameUsed(name, sessionId, data);
  if (nameError) {
    throw HTTPError(400, nameError);
  } else if (name === '') {
    name = generateRandomStringPlayer();
  }

  const session = data.quizSessions.find((s) => s.sessionId === sessionId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session ');
  } else if (session.state !== State.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  const playerId = generateRandomNumber();
  data.players.push({
    playerId: playerId,
    sessionId: sessionId,
    name: name,
    score: 0,
  });

  setData(data);
  return { playerId: playerId };
}

/**
 * Get the status of a guest player that has already joined a session
 * @param { number } playerId - the player ID to check
 * @returns { PlayerStatusReturn } - an object containing the player's status
 */
export function playerStatus(playerId: number): PlayerStatusReturn {
  const data = getData();

  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }

  const quizSession = data.quizSessions.find((q) => q.sessionId === player.sessionId);
  return {
    state: quizSession.state,
    numQuestions: quizSession.metadata.numQuestions,
    atQuestion: quizSession.atQuestion,
  };
}

/**
 * Get the information about a question that the guest player is on
 * Question position starts at 1
 *
 * @param { number } playerId - the player ID to check
 * @returns { playerQuestionInfo } - an object containing the question information
 */
export function playerQuestionInfo(playerId: number, questionPosition: number): PlayerQuestionInfoReturn {
  const data = getData();

  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }

  const quiz = data.quizSessions.find((q) => q.sessionId === player.sessionId);

  if (!quiz || questionPosition < 1 || questionPosition > quiz.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }

  if (quiz.state === State.LOBBY || quiz.state === State.QUESTION_COUNTDOWN || quiz.state === State.END) {
    throw HTTPError(400, `Session is in ${quiz.state}`);
  }

  if (quiz.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not currently on this question');
  }

  const Metadata = quiz.metadata.questions[questionPosition - 1];
  const AnswerBodyArray = Metadata.answers.map((answer) => {
    return {
      answerId: answer.answerId,
      answer: answer.answer,
      colour: answer.colour,
    };
  });

  return {
    questionId: Metadata.questionId,
    question: Metadata.question,
    duration: Metadata.duration,
    thumbnailUrl: Metadata.thumbnailUrl,
    points: Metadata.points,
    answers: AnswerBodyArray,
  };
}

/**
 * Allow the current player to submit answer(s) to the currently active question.
 * Question position starts at 1
 * Note: An answer can be re-submitted once first selection is made, as long as game is in the right state
 *
 * @param { number } playerId - the player ID to check
 * @param { number } questionPosition - the position of the question in the quiz
 * @param { number[] } answerIds - the answer IDs submitted
 * @returns { EmptyObject }
 */
export function playerQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]): EmptyObject {
  const data = getData();
  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }

  const session = data.quizSessions.find((s) => s.sessionId === player.sessionId);
  if (!session || session.state !== State.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  } else if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  // Check if the answerIds submitted are valid for this question
  const question = session.metadata.questions[questionPosition - 1];
  const validAnswers = question.answers.map((a) => a.answerId);
  if (!answerIds.every((answerId) => validAnswers.includes(answerId))) {
    throw HTTPError(400, 'Answer ID is not valid for this question');
  }

  // Check if there are any duplicate answerIds
  if (new Set(answerIds).size !== answerIds.length) {
    throw HTTPError(400, 'Duplicate answer IDs are not allowed');
  }

  // Less than 1 answer is submitted
  if (answerIds.length < 1) {
    throw HTTPError(400, 'At least one answer must be submitted');
  }

  const timeOpen = question.timeOpen || 0;
  const timeTaken = getCurrentTime() - timeOpen;

  const correctAnswers = question.answers.filter((answer) => answer.correct).map((answer) => answer.answerId);
  // check if all the answerIds submitted are correct
  const correct = answerIds.length === correctAnswers.length && answerIds.every((answerId) => correctAnswers.includes(answerId));

  if (correct) {
    const alreadyCorrect = question.playerCorrectList.find((p) => p.name === player.name);
    if (!alreadyCorrect) {
      question.playerCorrectList.push({
        playerId: playerId,
        name: player.name,
        submittedTime: getCurrentTime(),
      });
    } else {
      alreadyCorrect.submittedTime = getCurrentTime();
    }
  } else {
    question.playerCorrectList = question.playerCorrectList.filter((p) => p.name !== player.name);
  }

  const existingSubmission = question.playerAnswers.find((a) => a.playerId === playerId);
  if (existingSubmission) {
    existingSubmission.answerTime = timeTaken;
  } else {
    question.playerAnswers.push({
      playerId: playerId,
      answerTime: timeTaken,
    });
  }

  setData(data);
  return {};
}

/**
 * Get the results for a particular question of the session a player is playing in.
 * Question position starts at 1
 *
 * @param { number } playerId - the player ID to check
 * @param { number } questionPosition - the position of the question in the quiz
 * @returns { PlayerQuestionResultsReturn } - an object containing the results of the question
 */
export function playerQuestionResults(playerId: number, questionPosition: number): PlayerQuestionResultsReturn {
  const data = getData();
  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }

  const session = data.quizSessions.find((s) => s.sessionId === player.sessionId);
  if (!session || session.state !== State.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  } else if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  const question = session.metadata.questions[questionPosition - 1];

  let totalTime = 0;
  question.playerAnswers.forEach((answer) => {
    totalTime += answer.answerTime;
  });

  const averageAnswerTime = Math.round(totalTime / question.playerAnswers.length) || 0;
  const totalCorrect = question.playerCorrectList.length;
  const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
  const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);
  const sortedCorrectList = [...question.playerCorrectList].map((player) => player.name).sort();

  return {
    questionId: question.questionId,
    playersCorrectList: sortedCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect,
  };
}

/**
 * Get the final results for a whole session a player is playing in
 *
 * @param { number } playerId - the player ID to check
 * @returns { PlayerFinalResultsReturn } - an object containing the final results of the session
 */
export function playerFinalResults(playerId: number): PlayerFinalResultsReturn {
  const data = getData();
  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }
  const session = data.quizSessions.find((s) => s.sessionId === player.sessionId);
  if (!session || session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const players = data.players.filter((p) => p.sessionId === player.sessionId);
  players.forEach((p) => {
    const totalScore = getPlayerTotalScore(p.playerId, session.metadata.questions);
    p.score = Math.round(totalScore);
    setData(data);
  });

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
    const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
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
 * Returns all chat messages that are in the same session as the player, in order of time sent
 *
 * @param { number } playerId - the player ID to check
 * @returns { PlayerChatListReturn } - an object containing the chat messages
 */
export function playerChatList(playerId: number): PlayerChatListReturn {
  const data = getData();

  const player = data.players.find(player => player.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exist');
  }

  const messages = data.messages.filter(message => message.playerId === playerId);

  return { messages: messages };
}

/**
 * Adds a new message that is linked to a player ID
 *
 * @param { number } playerId - the player ID to add the message to
 * @param { ChatMessage } message - the message to add
 * @returns { EmptyObject }
 */
export function playerChatSend(playerId: number, message: ChatMessage): EmptyObject {
  const data = getData();

  const player = data.players.find(player => player.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exist');
  }

  if (message.messageBody.length > 100) {
    throw HTTPError(400, 'Message is more than 100 characters');
  } else if (message.messageBody === '') {
    throw HTTPError(400, 'Message is empty');
  }

  const playerName = player.name;
  data.messages.push({
    messageBody: message.messageBody,
    playerId: playerId,
    playerName: playerName,
    timeSent: getCurrentTime()
  });

  setData(data);
  return {};
}
