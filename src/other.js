import { getData, setData } from './dataStore.js';
import validator from 'validator';

/**
  * Reset the state of the application back to the start.
  * 
  * @param { } - has no parameters
  * @returns { } - returns nothing
*/
export function clear() {
  let dataStore = getData();
  dataStore.users = [];
  dataStore.quizzes = [];
  setData(dataStore);
  return {};
}

//////////////////////////////////////////////////////////////////////////////// 
/////////////////////////////// HELPER FUNCTIONS ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * Create a new error object with the given message
 * 
 * @param {string} message - the error message
 * @returns {{error: string}} - object containing the error message
 */
export function createError(message) {
  return { error: message };
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// AUTH HELPER FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * Given a registered user's email, returns the user object
 * Otherwise, returns undefined
 * 
 * @param {string} email 
 * @returns {object} - object containing the user's details
 */
export function findUserbyEmail(email) {
  const dataStore = getData();
  return dataStore.users.find(user => user.email === email);
}

/**
 * Given a userID, returns the user object
 * Otherwise, returns undefined if userID is not found
 * 
 * @param {number} authUserId 
 * @returns {object} - object containing the user's details
 */
export function findUserbyId(authUserId) {
  const dataStore = getData();
  return dataStore.users.find(user => user.authUserId === authUserId);
}

/**
 * Given a quizId, returns the quiz object
 * Otherwise, returns undefined if quizId is not found
 * 
 * @param {number} quizId 
 * @returns {object} - object containing the quiz details
 */
export function findQuizbyId(quizId) {
  const dataStore = getData();
  return dataStore.quizzes.find(quiz => quiz.quizId === quizId);
}

/**
 * Check if a string is a valid first or last name 
 * Returns null if the name is valid, otherwise returns an error object
 * 
 * @param {string} name - the first or last name of the user
 * @param {string} type - the type of name (First or Last)
 * @returns {{error: string}} - object containing the error message, or null if the name is valid
 */
export function isValidName(name, type) {
  if (name === '') {
    return createError(`${type} name is empty`);
  } else if (name.length > 20) {
    return createError(`${type} name is more than 20 characters`);
  } else if (typeof name !== 'string') {
    return createError(`${type} name is not a string`);
  } else if (name.length < 2) {
    return createError(`${type} name is less than 2 characters`);
  } else if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return createError(`${type} name contains invalid characters`);
  } else {
    return null;
  }
}

/**
 * Check if password is valid:
 * Returns null if the password is valid, otherwise returns an error object
 * 
 * @param {string} password - the password of the user
 * @returns {{error: string}} - object containing the error message, or null if the password is valid
 */
export function isValidPassword(password) {
  if (password === '') {
    return createError('Password is empty');
  } else if (typeof password !== 'string') {
    return createError('Password is not a string');
  } else if (password.length < 8) {
    return createError('Password is less than 8 characters');
  } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return createError('Password does not contain at least one letter and number');
  } else {
    return null;
  }
}

/**
 * Check if the email is valid:
 * Returns null if the email is valid, otherwise returns an error object
 * 
 * @param {string} email - the email of the user
 * @param {number} authUserId - the id of the user (if updating email) or -1 if registering
 * @returns {{error: string}} - object containing the error message, or null if the email is valid
 */
export function isValidEmail(email, authUserId) {
  if (email === '') {
    return createError('Email is empty');
  } else if (typeof email !== 'string') {
    return createError('Email is not a string');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (findUserbyEmail(email) === undefined && authUserId === -1) {
    return null;
  } else if (findUserbyEmail(email) === undefined && authUserId !== -1) {
    return null;
  } else if (findUserbyEmail(email).authUserId === authUserId) {
    return null;
  } else {
    return createError('Email is currently used by another user');
  } 
}

/**
 * Update dataStore with the given user object
 * 
 * @param {object} user - the user object
 * @returns { } - returns nothing
 */
export function updateUser(user) {
  const dataStore = getData();
  const index = dataStore.users.findIndex(u => u.authUserId === user.authUserId);
  dataStore.users[index] = user;
  setData(dataStore);
  return {};
}
////////////////////////////////////////////////////////////////////////////////
/////////////////////////// QUIZ HELPER FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * Return an array of quizzes for the user where each quiz is the object:
 * { 
 *   quizId: number,
 *   name: string,
 *   authUserId: number,
 *   description: string,
 *   timeCreated: unix timestamp,
 *   timeLastEdited: unix timestamp,
 * }
 * @param {number} authUserId - the id of registered user
 * @returns { Array<{object}> } - array containing the quizzes of the user
 */
export function getUserQuizzes(authUserId) {
  const dataStore = getData();
  return dataStore.quizzes.filter(quiz => quiz.authUserId === authUserId);
};

/**
 * Check if the quiz name is valid:
 * Returns null if the name is valid, otherwise returns an error object
 * 
 * @param {string} name - the name of the quiz
 * @returns {{error: string}} - object containing the error message, or null if the name is valid
 */
export function isValidQuizName(name) {
  if (name === '') {
    return createError('Name is empty');
  } else if (typeof name !== 'string') {
    return createError('Name is not a string');
  } else if (name.length < 3) {
    return createError('Name is less than 3 characters');
  } else if (name.length > 30) {
    return createError('Name is more than 30 characters');
  } else if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
    return createError('Name contains invalid characters');
  } else {
    return null;
  }
}

