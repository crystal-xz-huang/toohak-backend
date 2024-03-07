import {
  findQuizbyId,
  isValidAuthUserId,
  isValidQuizName,
  isValidQuizDescription,
  isQuizNameUsed,
  isValidQuizIdForUser,
  getQuizIndex,
} from './helper.js';

import { getData, setData } from './dataStore.js';
import timestamp from 'unix-timestamp';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * 
  * @returns {quizzes: Array<{quizId: number, name: string}>} - an object containing an array of quizzes
*/
export function adminQuizList(authUserId) {
  const dataStore = getData();

  let authUserError = isValidAuthUserId(authUserId, dataStore);
  if (authUserError) {
    return authUserError;
  }

  const quiz_list = dataStore.quizzes.filter(quiz => quiz.authUserId === authUserId).map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));
  return { 'quizzes': quiz_list };
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {string} name - the name of the quiz
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/
export function adminQuizCreate ( authUserId, name, description ) {
  const dataStore = getData();
  
  let authUserError = isValidAuthUserId(authUserId, dataStore);
  if (authUserError) {
    return authUserError;
  }

  let quizNameError = isValidQuizName(name);
  if (quizNameError) {
    return quizNameError;
  }

  let nameUsedError = isQuizNameUsed(name, authUserId, dataStore);
  if (nameUsedError) {
    return nameUsedError;
  }

  let descriptionError = isValidQuizDescription(description);
  if (descriptionError) {
    return descriptionError;
  }

  dataStore.quizId_counter = dataStore.quizId_counter + 1;

  const quiz = {
    quizId: dataStore.quizId_counter,
    name: name,
    authUserId: authUserId,
    description: description,
    timeCreated: timestamp.now(),
    timeLastEdited: timestamp.now(),
  };

  dataStore.quizzes.push(quiz);
  setData(dataStore);
  return { quizId: quiz.quizId };
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizRemove(authUserId, quizId) {
  const dataStore = getData();

  let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, dataStore);
  if (quizIdforUserError) {
    return quizIdforUserError;
  }

  const index = getQuizIndex(quizId, dataStore);
  dataStore.quizzes.splice(index, 1);
  setData(dataStore);
  
  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * 
  * @returns  {object} - object containing the quiz details
  * @property { quizId: number } - object containing quizId of the user
  * @property { name: string } - object containing name of quiz
  * @property { timeCreated: number } - object containing time quiz was created
  * @property { timeLastEdited: number} - object containing time quiz was last created
  * @property { description: string } - object containing a description of the quiz
*/
export function adminQuizInfo(authUserId, quizId) {
  const dataStore = getData();
  let quiz = findQuizbyId(quizId, dataStore);

  let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, dataStore);
  if (quizIdforUserError) {
    return quizIdforUserError;
  }

  return {
    'quizId': quiz.quizId,
    'name': quiz.name,
    'timeCreated': quiz.timeCreated,
    'timeLastEdited': quiz.timeLastEdited,
    'description': quiz.description,
  }
}

/**
  * Update name of relevant quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * @param {string} name - the name of quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizNameUpdate(authUserId, quizId, name) {
  const dataStore = getData();
  let quiz = findQuizbyId(quizId, dataStore);

  let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, dataStore);
  if (quizIdforUserError) {
    return quizIdforUserError;
  }

  let quizNameError = isValidQuizName(name);
  if (quizNameError) {
    return quizNameError;
  }

  let nameUsedError = isQuizNameUsed(name, authUserId, dataStore);
  if (nameUsedError) {
    return nameUsedError;
  }
 
  quiz.name = name;
  quiz.timeLastEdited = timestamp.now();
  dataStore.quizzes[getQuizIndex(quizId, dataStore)] = quiz;
  setData(dataStore);
  
  return {};
}

/**
  * Update the description of the relevant quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * @param {string} description - the description of quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  const dataStore = getData();
  let quiz = findQuizbyId(quizId, dataStore);  

  let quizIdforUserError = isValidQuizIdForUser(authUserId, quizId, dataStore);
  if (quizIdforUserError) {
    return quizIdforUserError;
  }

  let descriptionError = isValidQuizDescription(description);
  if (descriptionError) {
    return descriptionError;
  }

  quiz.description = description;
  quiz.timeLastEdited = timestamp.now();
  dataStore.quizzes[getQuizIndex(quizId, dataStore)] = quiz;
  setData(dataStore);

  return {};
}