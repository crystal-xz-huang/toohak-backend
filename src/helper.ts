import validator from 'validator';
import { Data, User, Quiz, ErrorMessage } from './types';
import {
  MIN_USER_NAME_LENGTH,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  USERNAME_REGEX,
  PASSWORD_REGEX,
  MIN_QUIZ_NAME_LENGTH,
  MAX_QUIZ_NAME_LENGTH,
  QUIZNAME_REGEX,
  MAX_QUIZ_DESCRIPTION_LENGTH,
} from './types';

/**
 * Create a new error object with the given message
 *
 * @param { string } message - the error message
 * @returns { ErrorMessage } - error message if invalid
 */
export function createError(message: string): ErrorMessage {
  return { error: message };
}

/**
 * Given a registered user's email, returns the user object
 * Otherwise, returns null
 *
 * @param { string }  email
 * @param { object } data - the data object from getData()
 * @returns { User | null } - object containing the user's details
 */
export function findUserbyEmail(email: string, data: Data): User | null {
  return data.users.find(user => user.email === email) ?? null;
}

/**
 * Given a userID, returns the user object
 * Otherwise, returns undefined if userID is not found
 *
 * @param { number } authUserId
 * @param { object } data - the data object from getData()
 * @returns { User | null } - object containing the user's details
 */
export function findUserbyId(authUserId: number, data: Data): User | null {
  return data.users.find(user => user.authUserId === authUserId) ?? null;
}

/**
 * Given a quizId, returns the quiz object
 * Otherwise, returns null if quizId is not found
 *
 * @param { number } quizId
 * @param { object } data - the data object from getData()
 * @returns { object | null } - object containing the quiz details
 */
export function findQuizbyId(quizId: number, data: Data): Quiz | null {
  return data.quizzes.find(quiz => quiz.quizId === quizId) ?? null;
}

/**
 * Returns the index of the user with the given authUserId's in data.users array
 * Otherwise, returns null if the user is not found
 *
 * @param { number } authUserId
 * @param { object } data - the data object from getData()
 * @returns { number | null } - the index of the user in data.users array
 */
export function getUserIndex(authUserId: number, data: Data): number | null {
  const index = data.users.findIndex(user => user.authUserId === authUserId);
  if (index === -1) {
    return null;
  }
}

/**
 * Returns the index of the quiz with the given quizId's in data.quizzes array
 * Otherwise, returns null if the quiz is not found
 *
 * @param { number}  quizId
 * @param { object } data - the data object from getData()
 * @returns { number | null } - the index of the quiz in data.quizzes array
 */
export function getQuizIndex(quizId: number, data: Data): number | null {
  const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
  if (index === -1) {
    return null;
  }
}

/**
 * Returns an array containing the quizzes of the user with the given authUserId
 * Otherwise, returns an empty array if no quizzes are found
 *
 * @param { number } authUserId - the id of registered user
 * @param { object } data - the data object from getData()
 * @returns { Array<Quiz> | [] } - array containing the quizzes of the user
 */
export function getUserQuizzes(authUserId: number, data: Data): Array<Quiz> | [] {
  return data.quizzes.filter(quiz => quiz.authUserId === authUserId);
}

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////// AUTH HELPER FUNCTIONS //////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/**
 * Check if a string is a valid first or last name:
 * 1. Name is not empty
 * 2. Name is between 2 and 20 characters
 * 3. Name contains only letters, spaces, hyphens, and apostrophes
 *
 * @param { string } name - the first or last name of the user
 * @param { string } type - the type of name (First or Last)
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidName(name: string, type: string): ErrorMessage | null {
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
 * 1. Password is not empty
 * 2. Password is a string
 * 3. Password is at least 8 characters long
 * 4. Password contains at least one letter and one number
 *
 * @param { string } password - the password of the user
 * @param { string } name - New password for adminUserPasswordUpdate, otherwise Password for adminAuthRegister
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidPassword(password: string, name: string): ErrorMessage | null {
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
 * Check if the email is valid:
 * 1. Email is not empty
 * 2. Email is a valid email address format
 *
 * @param { string } email
 * @param { object } data - the data object from getData()
 * @param { boolean } register - true if the email is used for registration (adminAuthRegister), false otherwise
 * @param { boolean } login - true if the email is used for login (adminAuthLogin), false otherwise
 * @param { number } authUserId - the id of registered user (optional - only for adminUserDetailsUpdate)
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidEmail(email: string, data : Data, register: boolean, login: boolean, authUserId? : number): ErrorMessage | null {
  if (email === '') {
    return createError('Email is empty');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (register && findUserbyEmail(email, data) !== null) {
    return createError('Email is currently used by another user');
  } else if (login && findUserbyEmail(email, data) === null) {
    return createError('Email does not exist');
  } else if (authUserId && findUserbyEmail(email, data) !== null && findUserbyEmail(email, data).authUserId !== authUserId) {
    return createError('Email is currently used by another user');
  }
  return null;
}

/**
 * Check if the authUserId is valid
 * Returns null if the authUserId is valid, otherwise returns an error object
 *
 * @param { number } authUserId
 * @param { object } data - the data object from getData()
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidAuthUserId(authUserId: number, data: Data): ErrorMessage | null {
  if (findUserbyId(authUserId, data) === undefined) {
    return createError('AuthUserId is not a valid user');
  }
  return null;
}

/// /////////////////////////////////////////////////////////////////////////////
/// //////////////////////// QUIZ HELPER FUNCTIONS //////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/**
 * Check if the quiz name is valid:
 * 1. Name is not empty
 * 2. Name is between 3 and 30 characters
 * 3. Name contains only letters, numbers, and spaces
 *
 * @param { string } name - the name of the quiz
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidQuizName(name: string): ErrorMessage | null {
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

/**
 * Check if the quiz description is valid (less than or equal to 100 characters)
 * Returns null if the description is valid, otherwise returns an error object
 *
 * @param { string } description
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isValidQuizDescription(description: string): ErrorMessage | null {
  if (description.length > MAX_QUIZ_DESCRIPTION_LENGTH) {
    return createError('Description is more than 100 characters');
  } else {
    return null;
  }
}

/**
 * Check if quiz name is already used by another quiz
 * Returns null if the name is not used, otherwise returns an error object
 *
 * @param { string } name - the name of the quiz
 * @param { number } authUserId - the id of registered user
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isQuizNameUsed(name: string, authUserId: number, data: Data): ErrorMessage | null {
  const userQuizzes: Array<Quiz> = getUserQuizzes(authUserId, data); 
  if (userQuizzes.some(quiz => quiz.name.toLowerCase() === name.toLowerCase())) {
    return createError('Name is already used by another quiz');
  }
  return null;
}

/**
 * Check if the quizId is valid for the given authUserId:
 * 1. authUserId is a valid user
 * 2. quizId is a valid quiz
 * 3. quizId is owned by the authUserId
 * Returns null if the quizId is valid, otherwise returns an error object
 *
 * @param { number } authUserId
 * @param { number } quizId
 * @param { object } data - the data object from getData()
 * @returns { ErrorMessage | null }  - error message if invalid, or null if the quizId is valid
 */
export function isValidQuizIdForUser(authUserId: number, quizId: number, data: Data): ErrorMessage | null {
  if (findUserbyId(authUserId, data) === undefined) {
    return createError('AuthUserId is not a valid user');
  } else if (findQuizbyId(quizId, data) === undefined) {
    return createError('QuizId is not a valid quiz');
  } else if (authUserId !== findQuizbyId(quizId, data).authUserId) {
    return createError('QuizId is not owned by user');
  }
  return null;
}
