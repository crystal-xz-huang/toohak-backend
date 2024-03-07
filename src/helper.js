import validator from 'validator';
import {
    MIN_USER_NAME_LENGTH,
    MAX_USER_NAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    USERNAME_REGEX,
    PASSWORD_REGEX,
    MIN_QUIZ_NAME_LENGTH,
    MAX_QUIZ_NAME_LENGTH,
    QUIZNAME_REGEX,
} from './types';


/**
 * Create a new error object with the given message
 * 
 * @param {string} message - the error message
 * @returns {{error: string}} - object containing the error message
 */
export function createError(message) {
  return { error: message };
}

/**
 * Given a registered user's email, returns the user object
 * Otherwise, returns undefined
 * 
 * @param {string} email 
 * @param {object} data - the data object from getData()
 * @returns {object} - object containing the user's details
 */
export function findUserbyEmail(email, data) {
  return data.users.find(user => user.email === email);
}
  
/**
 * Given a userID, returns the user object
 * Otherwise, returns undefined if userID is not found
 * 
 * @param {number} authUserId 
 * @param {object} data - the data object from getData()
 * @returns {object} - object containing the user's details
 */
export function findUserbyId(authUserId, data) {
  return data.users.find(user => user.authUserId === authUserId);
}
  
/**
 * Given a quizId, returns the quiz object
 * Otherwise, returns undefined if quizId is not found
 * 
 * @param {number} quizId 
 * @param {object} data - the data object from getData()
 * @returns {object} - object containing the quiz details
 */
export function findQuizbyId(quizId, data) {
  return data.quizzes.find(quiz => quiz.quizId === quizId);
}

/**
 * Returns the index of the user with the given authUserId's in data.users array
 * Otherwise, returns -1 if the user is not found
 * 
 * @param {number} authUserId 
 * @param {object} data - the data object from getData()
 * @returns {number} - the index of the user in data.users array
 */
export function getUserIndex(authUserId, data) {
  return data.users.findIndex(user => user.authUserId === authUserId);
}

/**
 * Returns the index of the quiz with the given quizId's in data.quizzes array
 * Otherwise, returns -1 if the quiz is not found
 * 
 * @param {number} quizId 
 * @param {object} data - the data object from getData()
 * @returns {number} - the index of the quiz in data.quizzes array
 */
export function getQuizIndex(quizId, data) {
  return data.quizzes.findIndex(quiz => quiz.quizId === quizId);
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// AUTH HELPER FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
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
  } else if (name.length > MAX_USER_NAME_LENGTH) {
    return createError(`${type} name is more than 20 characters`);
  } else if (name.length < MIN_USER_NAME_LENGTH) {
    return createError(`${type} name is less than 2 characters`);
  } else if (!USERNAME_REGEX.test(name)) {
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
 * @param {string} name - New password for adminUserPasswordUpdate, otherwise Password for adminAuthRegister
 * @returns {{error: string}} - object containing the error message, or null if the password is valid
 */
export function isValidPassword(password, name) {
  if (password === '') {
    return createError(`${name} is empty`);
  } else if (typeof password !== 'string') {
    return createError(`${name} is not a string`);
  } else if (password.length < MIN_PASSWORD_LENGTH) {
    return createError(`${name} is less than 8 characters`);
  } else if (!PASSWORD_REGEX.test(password)) {
    return createError(`${name} does not contain a letter and a number`);
  } else {
    return null;
  }
}

/**
 * Check if the email is valid
 * Returns null if the email is valid, otherwise returns an error object
 * 
 * @param {string} email 
 * @returns {{error: string}} - object containing the error message, or null if the email is valid
 */
export function isValidEmail(email) {
  if (email === '') {
    return createError('Email is empty');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else {
    return null;
  }
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////// QUIZ HELPER FUNCTIONS //////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * Returns an array containing the quizzes of the user with the given authUserId
 * Otherwise, returns an empty array if no quizzes are found
 * 
 * @param {number} authUserId - the id of registered user
 * @param {object} data - the data object from getData()
 * @returns { Array<{object}> } - array containing the quizzes of the user
 */
export function getUserQuizzes(authUserId, data) {
  return data.quizzes.filter(quiz => quiz.authUserId === authUserId);
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
  } else if (name.length < MIN_QUIZ_NAME_LENGTH) {
    return createError('Name is less than 3 characters');
  } else if (name.length > MAX_QUIZ_NAME_LENGTH) {
    return createError('Name is more than 30 characters');
  } else if (!QUIZNAME_REGEX.test(name)) {
    return createError('Name contains invalid characters');
  } else {
    return null;
  }
}
