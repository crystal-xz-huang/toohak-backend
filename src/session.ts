// import { getData, setData } from './dataStore';
// import HTTPError from 'http-errors';
import {
  EmptyObject,
  AdminQuizSessionListReturn,
  AdminQuizSessionStartReturn,
  AdminQuizSessionStatusReturn,
  AdminQuizSessionResultsReturn,
  AdminQuizSessionResultsCSVReturn
} from './dataTypes';

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 *
 * @param { string } token
 * @param { number } quizId
 * @returns { AdminQuizSessionListReturn } - an object containing the active and inactive session ids
 */
export function adminQuizSessionList(token: string, quizId: number): AdminQuizSessionListReturn {
  return {
    activeSessions: [0],
    inactiveSessions: [0],
  };
}

/**
 * Starts a new session for a quiz
 * This copies the quiz, so that any edits whilst a session is running does not affect active session
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } autoStartNum - number of people to autostart the quiz once that number of people have joined
 * @returns { AdminQuizSessionStartReturn } - the session ID of the new session
 */
export function adminQuizSessionStart(token: string, quizId: number, autoStartNum: number): AdminQuizSessionStartReturn {
  return { sessionId: 0 };
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
  return {
    state: 'LOBBY',
    atQuestion: 3,
    players: ['Hayden'],
    metadata: {
      quizId: 5546,
      name: 'This is the name of the quiz',
      timeCreated: 1683019484,
      timeLastEdited: 1683019484,
      description: 'This quiz is so we can have a lot of fun',
      numQuestions: 1,
      questions: [
        {
          questionId: 5546,
          question: 'Who is the Monarch of England?',
          duration: 4,
          thumbnailUrl: 'http://google.com/some/image/path.jpg',   // uncomment this property from QuestionBody in dataTypes.ts
          points: 5,
          answers: [
            {
              answerId: 2384,
              answer: 'Prince Charles',
              colour: 'red',
              correct: true
            }
          ]
        }
      ],
      duration: 44,
      thumbnailUrl: 'http://google.com/some/image/path.jpg'
    }
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
