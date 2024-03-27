import { EmptyObject, ErrorMessage, AdminQuizCreateReturn, AdminQuizListReturn, AdminQuizInfoReturn, AdminQuizTrashViewReturn } from './dataTypes';
import {
  isValidToken,
  findUserbyToken,
  findQuizbyId,
  getCurrentTime,
  isValidQuizName,
  isValidQuizDescription,
  isQuizNameUsed,
  isValidQuizIdForUser,
  // getQuizIndex,
} from './functionHelpers';
import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

// ====================================================================================
// !! IMPORTANT !!
// Errors must be thrown in the following order: 401, then 403, then 400
// Use throw HTTPError(status code, 'error message') to throw a specific HTTP error
// Use getCurrentTime() to get the UNIX timestamp
// ====================================================================================

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param { string } token - the token that corresponds to a user session
  * @returns { QuizList | ErrorMessage } - an object containing an array of quizzes
*/
export function adminQuizList(token: string): AdminQuizListReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  // find all quizzes that are owned by the currently logged in user
  const authUserId = findUserbyToken(token, data).authUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param { number } authUserId - the id of registered user
  * @param { string } name - the name of the quiz
  * @param { string } description - basic details about the quiz
  * @returns { QuizId | ErrorMessage } - object containing quizId of the user
*/
export function adminQuizCreate(token: string, name: string, description: string): AdminQuizCreateReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const inputError = isValidQuizName(name) ??
                     isQuizNameUsed(name, authUserId, data) ??
                     isValidQuizDescription(description);
  if (inputError) {
    throw HTTPError(400, inputError.error);
  }

  data.quizId_counter = data.quizId_counter + 1;
  data.quizzes.push({
    quizId: data.quizId_counter,
    name: name,
    authUserId: authUserId,
    description: description,
    timeCreated: getCurrentTime(),
    timeLastEdited: getCurrentTime(),
    numQuestions: 0,
    questions: [],
    duration: 0,
    valid: true
  });

  setData(data);
  return { quizId: data.quizId_counter };
}

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param { number } quizId - the id of the quiz
  * @param { string } token - the token that corresponds to a user session
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizRemove(token: string, quizId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = findQuizbyId(quizId, data);
  if (quiz) {
    quiz.valid = false;
    quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  }
  setData(data);

  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param { string } token - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @returns  { QuizInfo | ErrorMessage } - object containing the quiz details
*/
export function adminQuizInfo(token: string, quizId: number): AdminQuizInfoReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = findQuizbyId(quizId, data);
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
}

/**
  * Update name of relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } name - the name of the quiz
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizNameUpdate(token: string, quizId: number, name: string): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quizNameError = isValidQuizName(name) ?? isQuizNameUsed(name, authUserId, data);
  if (quizNameError) {
    throw HTTPError(400, quizNameError.error);
  }

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].name = name;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } description - the description of quiz
  *
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const descriptionError = isValidQuizDescription(description);
  if (descriptionError) {
    throw HTTPError(400, descriptionError.error);
  }

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * View the quizzes that are currently in the trash for the logged in user
 *
 * @param { string } token - the token that corresponds to a user session
 * @returns { AdminQuizTrashViewReturn | ErrorMessage } - an object containing an array of quizzes
 */
export function adminQuizTrashView(token: string): AdminQuizTrashViewReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = data.sessions.find(session => session.token === token).adminUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId && !quiz.valid)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

export function adminQuizRestore(token: string, quizId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = findQuizbyId(quizId, data);
  if (quiz.valid) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that is not currently invalid or in the trash');
  }

  const isNameUsed = data.quizzes.some(q => q.name === quiz.name && q.valid === true && q.quizId !== quizId);
  if (isNameUsed) {
    throw HTTPError(400, 'Quiz name of the restored quiz is already used by another active quiz');
  }

  quiz.valid = true;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  setData(data);

  return {};
}

export function adminQuizTransfer(token: string, quizId: number,userEmail: string): EmptyObject | ErrorMessage {
  return {};
}
