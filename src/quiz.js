import {
  createError,
  findUserbyId,
  findQuizbyId,
  isValidQuizName,
  getUserQuizzes
} from './other.js';

import { getData, setData } from './dataStore.js';
import timestamp from 'unix-timestamp';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * 
  * @returns {quizzes: Array<{quizId: number, name: string}>} - an object containing an array of quizzes
*/
export function adminQuizList ( authUserId ) {
  const dataStore = getData();
  const newList = [];
  
  if (findUserbyId(authUserId) === undefined) {
    return {error: 'AuthUserId is not a valid user'}
  }
  else {
    const listOfQuizzes = getUserQuizzes(authUserId);

    for (const quiz of listOfQuizzes) {
      newList.push(
        {
          quizId: quiz.quizId,
          name: quiz.name,
        }
      )
    }
  }
  return {quizzes: newList};
}

/**
  * Given basic details about a new quiz,
  * create one for the logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {string} name - the name of the quiz
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/
export function adminQuizCreate ( authUserId, name, description ) {
  let user = findUserbyId(authUserId);
  if (user === undefined) {
    return createError('AuthUserId is not a valid user');
  }

  let quizNameError = isValidQuizName(name);
  if (quizNameError) {
    return quizNameError;
  }

  let user_quizzes = adminQuizList(authUserId);
  for (const quiz of user_quizzes.quizzes) {
    if (quiz.name === name || quiz.name.toLowerCase() === name.toLowerCase()){
      return createError('Name is already used by another quiz');
    }
  }

  if (description.length > 100) {
    return createError('Description is more than 100 characters');
  }

  const dataStore = getData();
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
  let user = findUserbyId(authUserId);
  let quiz = findQuizbyId(quizId);

  if (quiz === undefined) {
    return createError('Quiz ID does not refer to a valid quiz');
  }
  else if (user === undefined) {
    return createError('AuthUserId is not a valid user.');
  }
  else if (quiz.authUserId !== user.authUserId) {
    return createError('Quiz ID does not refer to a quiz that this user owns');
  }
  else {
    const dataStore = getData();
    const index = dataStore.quizzes.findIndex((quiz) => quiz.quizId === quizId)

    dataStore.quizzes.splice(index, 1);
    setData(dataStore);
  }
  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
  * @returns { name: string } - object containing name of quiz
  * @returns { timeCreated: number } - object containing time quiz was created
  * @returns { timeLastEdited: number} - object containing time quiz was last created
  * @returns { description: string } - object containing a description of the quiz
*/
export function adminQuizInfo(authUserId, quizId) {
  let user = findUserbyId(authUserId);
  let quiz = findQuizbyId(quizId);

  if (quiz === undefined) {
    return createError('Quiz ID does not refer to a valid quiz');
  }
  else if (user === undefined) {
    return createError('AuthUserId is not a valid user.');
  }
  else if (quiz.authUserId !== user.authUserId) {
    return createError('Quiz ID does not refer to a quiz that this user owns');
  }
  else {
    return {
      quizId: quiz.quizId,
      name: quiz.name,
      timeCreated: quiz.timeCreated,
      timeLastEdited: quiz.timeLastEdited,
      description: quiz.description,
    }
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
  // check that the user exists and is valid
  let user = findUserbyId(authUserId);
  if (user === undefined) {
    return createError('AuthUserId is not a valid user');
  }

  // check if quiz exists by Id and that the quiz is owned by the current user
  let quiz = findQuizbyId(quizId);
  if (quiz === undefined) {
    return createError('QuizId is not a valid quiz');
  } else if (authUserId !== quiz.authUserId) {
    return createError('QuizId is not owned by user');
  }

  // check if name is valid
  let quizNameError = isValidQuizName(name);
  if (quizNameError) {
    return quizNameError;
  }

  // check if name is already used by another quiz for the user (case insensitive check)
  let user_quizzes = adminQuizList(authUserId);
  for (const quiz of user_quizzes.quizzes) {
    if (quiz.name === name || quiz.name.toLowerCase() === name.toLowerCase()){
      return createError('Name is already used by another quiz');
    }
  }

  // update the name of the quiz in the dataStore
  const dataStore = getData();
  quiz.name = name;
  quiz.timeLastEdited = timestamp.now();
  dataStore.quizzes[quizId - 1] = quiz;
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
  // check that the user exists and is valid
  let user = findUserbyId(authUserId);
  if (user === undefined) {
    return createError('AuthUserId is not a valid user');
  }

  // check if quiz exists by Id and that the quiz is owned by the current user
  let quiz = findQuizbyId(quizId);
  if (quiz === undefined) {
    return createError('QuizId is not a valid quiz');
  } else if (authUserId !== quiz.authUserId) {
    return createError('QuizId is not owned by user');
  }

  // checks if description is a valid length
  if (description.length > 100) {
    return createError('Description is more than 100 characters');
  }

  // update the description of the quiz in the dataStore
  const dataStore = getData();
  quiz.description = description;
  quiz.timeLastEdited = timestamp.now();
  dataStore.quizzes[quizId - 1] = quiz;
  setData(dataStore);
  return {};
}