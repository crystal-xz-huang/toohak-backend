import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  State,
  // Action,
} from './dataTypes';
import {
  EmptyObject,
  ChatMessage,
  PlayerJoinReturn,
  PlayerStatusReturn,
  PlayerQuestionInfoReturn,
  PlayerQuestionResultsReturn,
  PlayerFinalResultsReturn,
  EmptyObject,
  // PlayerChatListReturn,
} from './functionTypes';

import {
  generateRandomNumber,
  generateRandomStringPlayer,
  isPlayerNameUsed,
  getCurrentTime,
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
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session ');
  } else if (session.state !== State.QUESTION_OPEN) {
    throw HTTPError(400, 'Session is not in QUESTION_OPEN state');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  } else if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  // Check if the answerIds submitted are valid
  const question = session.metadata.questions[questionPosition - 1];
  const validAnswers = question.answers.map((answer) => answer.answerId);
  if (answerIds.some((answerId) => !validAnswers.includes(answerId))) {
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

  const timeTaken = getCurrentTime() - question.timeOpen;
  // update the player's submissions
  const correctAnswers = question.answers.filter((answer) => answer.correct).map((answer) => answer.answerId).sort();
  const playerAnswers = question.playerAnswers.find((answer) => answer.playerId === playerId);
  if (playerAnswers) {
    playerAnswers.answerTime = timeTaken;
    playerAnswers.answers = answerIds;
  } else {
    question.playerAnswers.push({
      playerId: playerId,
      answerTime: timeTaken,
      answers: answerIds,
    });
  }

  const questionPoints = question.points;
  const correct = answerIds.sort().every((answerId, index) => answerId === correctAnswers[index]);
  if (correct && !question.playerCorrectList.includes(player.name)) {
    // add the player to the correct list if they answered correctly
    question.playerCorrectList.push(player.name);
    const N = question.playerCorrectList.indexOf(player.name);
    player.score += questionPoints * (1 / (N + 1));
  } else if (!correct && question.playerCorrectList.includes(player.name)) {
    // remove the player from the correct list if they answered incorrectly
    const N = question.playerCorrectList.indexOf(player.name);
    player.score -= questionPoints * (1 / (N + 1));
    question.playerCorrectList = question.playerCorrectList.filter((name) => name !== player.name);
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
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session ');
  } else if (session.state !== State.ANSWER_SHOW) {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }

  if (questionPosition < 1 || questionPosition > session.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  } else if (session.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  const question = session.metadata.questions[questionPosition - 1];

  // calculate the average time taken to answer the question
  const totalTime = question.playerAnswers.reduce((total, answer) => total + answer.answerTime, 0);
  const averageAnswerTime = Math.round(totalTime / question.playerAnswers.length);

  // calculate the percentage of players who answered the question correctly
  const totalCorrect = question.playerCorrectList.length;
  const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
  const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);

  return {
    questionId: question.questionId,
    playersCorrectList: question.playerCorrectList,
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
  // if playerId does not exist, throw an error
  const player = data.players.find((p) => p.playerId === playerId);
  if (!player) {
    throw HTTPError(400, 'Player Id does not exists');
  }

  // if session does not exist or is not in FINAL_RESULTS state, throw an error
  const session = data.quizSessions.find((s) => s.sessionId === player.sessionId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session ');
  } else if (session.state !== State.FINAL_RESULTS) {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const questions = session.metadata.questions;
  const questionResults: PlayerQuestionResultsReturn[] = questions.map((question) => {
    const totalTime = question.playerAnswers.reduce((total, answer) => total + answer.answerTime, 0);
    const averageAnswerTime = Math.round(totalTime / question.playerAnswers.length);
    const totalCorrect = question.playerCorrectList.length;
    const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
    const percentCorrect = totalPlayers === 0 ? 0 : Math.round((totalCorrect / totalPlayers) * 100);
    return {
      questionId: question.questionId,
      playersCorrectList: question.playerCorrectList,
      averageAnswerTime: averageAnswerTime,
      percentCorrect: percentCorrect,
    };
  });

  const usersRankedByScore = data.players
    .filter((p) => p.sessionId === player.sessionId)
    .sort((a, b) => b.score - a.score)
    .map((p) => {
      return {
        name: p.name,
        score: p.score,
      };
    });

  return {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults,
  };
}

/**
 * Returns all chat messages that are in the same session as the player, in order of time sent
 *
 * @param { number } playerId - the player ID to check
 * @returns { PlayerChatListReturn } - an object containing the chat messages
 */
/* export function playerChatList(playerId: number): PlayerChatListReturn {
  return {
    messages: [
      {
        messageBody: 'This is a message body',
        playerId: 5546,
        playerName: 'Yuchao Jiang',
        timeSent: 1683019484
      }
    ]
  };
} */

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
