import { QuizList, ErrorMessage, QuizId, QuizInfo, EmptyObject } from './types';
import {
  findQuizbyId,
  isValidAuthUserId,
  isValidQuizName,
  isValidQuizDescription,
  isQuizNameUsed,
  isValidQuizIdForUser,
  getQuizIndex,
} from './helper';

import { getData, setData } from './dataStore';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param { number } authUserId - the id of registered user
  * @returns { QuizList | ErrorMessage } - an object containing an array of quizzes
*/
export function adminQuizList(authUserId: number): QuizList | ErrorMessage {
  const data = getData();

  const authUserError = isValidAuthUserId(authUserId, data);
  if (authUserError) {
    return authUserError;
  }

  const quizDetails = data.quizzes.filter(quiz => quiz.authUserId === authUserId).map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));
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
export function adminQuizCreate (authUserId: number, name: string, description: string): QuizId | ErrorMessage {
  const data = getData();
  const error = isValidAuthUserId(authUserId, data) ?? isValidQuizName(name) ?? isQuizNameUsed(name, authUserId, data) ?? isValidQuizDescription(description);
  if (error) {
    return error;
  }

  data.quizId_counter = data.quizId_counter + 1;
  data.quizzes.push({
    quizId: data.quizId_counter,
    name: name,
    authUserId: authUserId,
    description: description,
    timeCreated: Math.floor(Date.now() / 1000),
    timeLastEdited: Math.floor(Date.now() / 1000),
  });

  setData(data);
  return { quizId: data.quizId_counter };

  // let authUserError = isValidAuthUserId(authUserId, data);
  // if (authUserError) {
  //   return authUserError;
  // }

  // let quizNameError = isValidQuizName(name);
  // if (quizNameError) {
  //   return quizNameError;
  // }

  // let nameUsedError = isQuizNameUsed(name, authUserId, data);
  // if (nameUsedError) {
  //   return nameUsedError;
  // }

  // let descriptionError = isValidQuizDescription(description);
  // if (descriptionError) {
  //   return descriptionError;
  // }
}

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param { number } authUserId - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @returns { {} | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizRemove(authUserId: number, quizId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, data);
  if (quizIdforUserError) {
    return quizIdforUserError;
  }

  const index = getQuizIndex(quizId, data);
  data.quizzes.splice(index, 1);
  setData(data);

  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param { number } authUserId - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @returns  { QuizInfo | ErrorMessage } - object containing the quiz details
*/
export function adminQuizInfo(authUserId: number, quizId: number): QuizInfo | ErrorMessage {
  const data = getData();
  const quiz = findQuizbyId(quizId, data);

  const quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, data);
  if (quizIdforUserError) return quizIdforUserError;

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
}

/**
  * Update name of relevant quiz.
  *
  * @param { number } authUserId - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @param { string } name - the name of quiz
  * @returns { {} | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizNameUpdate(authUserId: number, quizId: number, name: string): EmptyObject | ErrorMessage {
  const data = getData();
  const error = isValidQuizIdForUser(authUserId, quizId, data) ?? isValidQuizName(name) ?? isQuizNameUsed(name, authUserId, data);
  if (error) return error;

  data.quizzes[getQuizIndex(quizId, data)].name = name;
  data.quizzes[getQuizIndex(quizId, data)].timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);

  return {};

  // let quiz = findQuizbyId(quizId, data);

  // let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, data);
  // if (quizIdforUserError) {
  //   return quizIdforUserError;
  // }

  // let quizNameError = isValidQuizName(name);
  // if (quizNameError) {
  //   return quizNameError;
  // }

  // let nameUsedError = isQuizNameUsed(name, authUserId, data);
  // if (nameUsedError) {
  //   return nameUsedError;
  // }

  // quiz.name = name;
  // quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  // data.quizzes[getQuizIndex(quizId, data)] = quiz;
  // setData(data);

  // return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param { number } authUserId - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @param { string } description - the description of quiz
  *
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizDescriptionUpdate(authUserId: number, quizId: number, description: string): EmptyObject | ErrorMessage {
  const data = getData();
  const error = isValidQuizIdForUser(authUserId, quizId, data) ?? isValidQuizDescription(description);
  if (error) {
    return error;
  }

  data.quizzes[getQuizIndex(quizId, data)].description = description;
  data.quizzes[getQuizIndex(quizId, data)].timeLastEdited = Math.floor(Date.now() / 1000);
  setData(data);
  return {};

  // let quiz = findQuizbyId(quizId, data);

  // let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, data);
  // if (quizIdforUserError) {
  //   return quizIdforUserError;
  // }

  // let descriptionError = isValidQuizDescription(description);
  // if (descriptionError) {
  //   return descriptionError;
  // }

  // quiz.description = description;
  // quiz.timeLastEdited = Math.floor(Date.now() / 1000);
  // data.quizzes[getQuizIndex(quizId, data)] = quiz;
  // setData(data);

  // return {};
}
