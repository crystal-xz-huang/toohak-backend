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

  let timeTaken = 0;
  if (!question.timeOpen) {
    timeTaken = getCurrentTime() - question.timeOpen;
  }

  // correctAnswers is an array of the correct answerIds
  const correctAnswers = question.answers.filter((a) => a.correct).map((a) => a.answerId).sort((a, b) => a - b);
  // check if the answerIds submitted are correct
  const correct = answerIds.sort((a, b) => a - b).every((answerId, index) => answerId === correctAnswers[index]);

  const questionPoints = question.points;
  const inplayerCorrectList = question.playerCorrectList.find((p) => p.name === player.name);

  let previousScore = 0;
  const submissions = question.playerAnswers.find((answer) => answer.playerId === playerId);
  if (submissions) {
    previousScore = submissions.score;
  }

  let newScore = 0;
  if (correct && !inplayerCorrectList) {
    // correct and not in the correct list
    question.playerCorrectList.push({
      name: player.name,
      answerTime: timeTaken,
    });
    question.playerCorrectList.sort((a, b) => a.answerTime - b.answerTime);
    const N = question.playerCorrectList.findIndex((p) => p.name === player.name);
    newScore = questionPoints * (1 / (N + 1));
  } else if (!correct && inplayerCorrectList) {
    // incorrect and in the correct list
    // remove the player from the correct list
    question.playerCorrectList = question.playerCorrectList.filter((p) => p.name !== player.name);
  } else if (correct && inplayerCorrectList) {
    // correct and in the correct list
    inplayerCorrectList.answerTime = timeTaken;

    // calculate the new score
    question.playerCorrectList.sort((a, b) => a.answerTime - b.answerTime);
    const N = question.playerCorrectList.findIndex((p) => p.name === player.name);
    newScore = questionPoints * (1 / (N + 1));
  }

  // update the player's total score
  player.score = player.score - previousScore + newScore;

  // update the player's answer submission
  if (submissions) {
    submissions.answerTime = timeTaken;
    submissions.answerIds = answerIds;
    submissions.score = newScore;
  } else {
    question.playerAnswers.push({
      playerId: playerId,
      answerTime: timeTaken,
      answerIds: answerIds,
      score: newScore,
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
  let totalTime = 0;
  question.playerAnswers.forEach((answer) => {
    totalTime += answer.answerTime;
  });
  const averageAnswerTime = Math.round(totalTime / question.playerAnswers.length);

  // calculate the percentage of players who answered the question correctly
  const totalCorrect = question.playerCorrectList.length || 0;
  const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
  const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);

  const sortedCorrectList = [...question.playerCorrectList].map((player) => player.name).sort();

  return {
    questionId: question.questionId,
    playersCorrectList: sortedCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect,
  };

  /*
  const totalTime = question.playerAnswers.reduce((total, answer) => total + answer.answerTime, 0);
  const averageAnswerTime = Math.round(totalTime / question.playerAnswers.length);

  // calculate the percentage of players who answered the question correctly
  const totalCorrect = question.playerCorrectList.length;
  const totalPlayers = data.players.filter((p) => p.sessionId === player.sessionId).length;
  const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);

  const sortedCorrectList = [...question.playerCorrectList].sort();
  return {
    questionId: question.questionId,
    playersCorrectList: sortedCorrectList,
    averageAnswerTime: averageAnswerTime,
    percentCorrect: percentCorrect,
  };

  */
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
    const percentCorrect = Math.round((totalCorrect / totalPlayers) * 100);
    const sortedCorrectList = [...question.playerCorrectList].map((player) => player.name).sort();
    return {
      questionId: question.questionId,
      playersCorrectList: sortedCorrectList,
      averageAnswerTime: averageAnswerTime || 0,
      percentCorrect: percentCorrect,
    };
  });

  // list of all users who played ranked in descending order by score
  const usersRankedByScore = data.players
    .filter((p) => p.sessionId === player.sessionId)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .sort((a, b) => Math.round(b.score) - Math.round(a.score))
    .map((p) => {
      return {
        name: p.name,
        score: Math.round(p.score || 0),
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
