import { getData, setData } from './dataStore.js';
import validator from 'validator';

/**
  * Reset the state of the application back to the start.
  * 
  * @param { } - has no parameters
  * 
  * @returns { } - returns nothing
*/
export function clear() {
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
 * @returns {{error: string}} - object containing the error message, or null if the email is valid
 */
export function isValidEmail(email) {
  if (email === '') {
    return createError('Email is empty');
  } else if (typeof email !== 'string') {
    return createError('Email is not a string');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (findUserbyEmail(email)) {
    return createError('Email already exists');
  } else {
    return null;
  }
}

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
 * @param {number} userId 
 * @returns {object} - object containing the user's details
 */
export function findUserbyId(authUserId) {
  const dataStore = getData();
  return dataStore.users.find(user => user.userId === userId);
}
