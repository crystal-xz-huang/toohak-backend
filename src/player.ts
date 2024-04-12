import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  State,
  // Action,
} from './dataTypes';
import {
  // EmptyObject,
  // ChatMessage,
  PlayerJoinReturn,
  // PlayerStatusReturn,
  // PlayerQuestionInfoReturn,
  // PlayerQuestionAnswerReturn,
  // PlayerQuestionResultsReturn,
  // PlayerFinalResultsReturn,
  // PlayerChatListReturn,
} from './functionTypes';

import {
  generateRandomNumber,
  generateRandomStringPlayer,
  isPlayerNameUsed,
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
  }

  const session = data.quizSessions.find((s) => s.sessionId === sessionId);
  if (!session) {
    throw HTTPError(400, 'Session Id does not refer to a valid session ');
  }

  const sessionState = data.quizSessions.find((s) => s.sessionId === sessionId).state;
  if (sessionState !== State.LOBBY) {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }

  if (name === '') {
    name = generateRandomStringPlayer();
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
/* export function playerStatus(playerId: number): PlayerStatusReturn {
  return {
    state: 'LOBBY',
    numQuestions: 0,
    atQuestion: 0,
  };
} */

/**
 * Get the information about a question that the guest player is on
 * Question position starts at 1
 *
 * @param { number } playerId - the player ID to check
 * @returns { playerQuestionInfo } - an object containing the question information
 */
/* export function playerQuestionInfo(playerId: number, questionPosition: number): PlayerQuestionInfoReturn {
  return {
    questionId: 0,
    question: 'Who is the Monarch of England?',
    duration: 30,
    points: 100,
    answers: [
      { answerId: 0, answer: 'Prince Charles', colour: 'red' },
    ],
  };
} */

/**
 * Allow the current player to submit answer(s) to the currently active question.
 * Question position starts at 1
 * Note: An answer can be re-submitted once first selection is made, as long as game is in the right state
 *
 * @param { number } playerId - the player ID to check
 * @param { number } questionPosition - the position of the question in the quiz
 * @param { number[] } answerIds - the answer IDs submitted
 * @returns { PlayerQuestionAnswerReturn } - an object containing the answer IDs submitted
 */
/* export function playerQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]): PlayerQuestionAnswerReturn {
  return {
    answerIds: [0]
  };
} */

/**
 * Get the results for a particular question of the session a player is playing in.
 * Question position starts at 1
 *
 * @param { number } playerId - the player ID to check
 * @param { number } questionPosition - the position of the question in the quiz
 * @returns { PlayerQuestionResultsReturn } - an object containing the results of the question
 */
/* export function playerQuestionResults(playerId: number, questionPosition: number): PlayerQuestionResultsReturn {
  return {
    questionId: 0,
    playersCorrectList: ['Player 1', 'Player 2'],
    averageAnswerTime: 10,
    percentCorrect: 50,
  };
} */

/**
 * Get the final results for a whole session a player is playing in
 *
 * @param { number } playerId - the player ID to check
 * @returns { PlayerFinalResultsReturn } - an object containing the final results of the session
 */
/* export function playerFinalResults(playerId: number): PlayerFinalResultsReturn {
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
} */

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
}

export function playerChatSend(playerId: number, message: ChatMessage): EmptyObject {
  return {};
} */
