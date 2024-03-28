import validator from 'validator';
import { Data, User, Quiz, Session, ErrorMessage, Token, QuestionBodyInput } from './dataTypes';
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
} from './dataTypes';

// ====================================================================
// TOKENS & SESSIONS
// ====================================================================
/**
 * Tokens - Used by the client to identify their session to the server
 *
 * Sessions - Used by the server to identify the client's session
 *
 * Whenever we need to return a token, we should create a new session to pair it with.
 * The actions that trigger this are:
 * - Registering
 * - Logging in
 *
 * Method:
 * 1. Create a new sessionId with data.sessionId_counter + 1
 * 2. Generate a token with the function generateToken(sessionId: number)
 * 3. Create a new session object with the sessionId, authUserId, token, valid, and timeCreated
 * 4. Push the new session object to data.sessions
 * 5. Save the updated data object to the database with setData(data)
 */

/**
 * Hashes a string using a simple hash function
 */
export function hashOf(str: string): string {
  const baseStr = str + 'hashed_secret';
  let hash = 0;
  for (let i = 0; i < baseStr.length; i++) {
    hash = Math.imul(31, hash) + baseStr.charCodeAt(i) | 0;
  }
  return hash.toString();
}

/**
 * Generates a token for a new session (unique string each time)
 */
export function generateToken(sessionId: number): string {
  const token = `session-${sessionId}-${Date.now()}`;
  return hashOf(token);
}

/**
 * Given a userId, return the token for a logged in user session
 */
export function findTokenforUser(authUserId: number, data: Data): Token | null {
  const session = data.sessions.find(session => session.adminUserId === authUserId);
  if (session === undefined || session.valid === false) {
    return null;
  }
  return { token: session.token };
}

/**
 * Given a token, returns the session object
 * Otherwise, returns null (if the token is not found)
 */
export function findSessionbyToken(token: string, data: Data): Session | null {
  return data.sessions.find(session => session.token === token) ?? null;
}

/**
 * Given a token, returns the user associated with the token
 * Otherwise, returns null (if the token does not refer to a session)
 */
export function findUserbyToken(token: string, data: Data): User | null {
  const session = findSessionbyToken(token, data);
  if (session === null || session.valid === false) {
    return null;
  }
  return findUserbyId(session.adminUserId, data);
}

/**
 * Given the authUserId, returns all the valid logged-in sessions for the user
 */
export function findValidSessionsforUser(authUserId: number, data: Data): Array<Session> | [] {
  const sessions = data.sessions.filter(session => session.adminUserId === authUserId);
  // return only the valid sessions
  return sessions.filter(session => session.valid === true);
}

export function getSessionIndex(token: string, data: Data): number | null {
  const index = data.sessions.findIndex(session => session.token === token);
  if (index === -1) {
    return null;
  }
}
/// /////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////  GLOBAL HELPER FUNCTIONS  //////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////
/**
 * Returns the Unix timestamp in seconds
 */
export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
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

/// ////////////////////////////////////////////////////////////////////////////////////
/// ///////////////////////////  ERROR CHECKING  ////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////////////
/**
 * Create a new error object with the given message
 *
 * @param { string } message - the error message
 * @returns { ErrorMessage } - error message if invalid
 */
export function createError(message: string): ErrorMessage {
  return { error: message };
}
/// //////////////////////////////// TOKENS & SESSIONS ///////////////////////////////////
/**
 * Given a token, returns an error message if the token is invalid (does not refer to a valid logged-in session)
 * Otherwise, returns null
 */
export function isValidToken(token: string, data: Data): ErrorMessage | null {
  if (token === '') {
    return createError('Token is empty');
  }
  const session = data.sessions.find(session => session.token === token);
  if (session === undefined) {
    return createError('Invalid token');
  } else if (session.valid === false) {
    return createError('Invalid token');
  }
  return null;
}

/// /////////////////////////////////// AUTH ADMIN ///////////////////////////////////////
/**
 * Check if a string is a valid first or last name
 * Returns an error message if invalid, or null if valid
 * Invalid if:
 * 1. Name is not empty
 * 2. Name is between 2 and 20 characters
 * 3. Name contains only letters, spaces, hyphens, and apostrophes
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
 * Check if password is valid
 * Returns an error message if invalid, or null if valid\
 * Invalid if:
 * 1. Password is not empty
 * 2. Password is a string
 * 3. Password is at least 8 characters long
 * 4. Password contains at least one letter and one number
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
 * Check if the email is valid for adminAuthRegister
 * Returns null if the email is valid, otherwise returns an error object
 */
export function isValidRegisterEmail(email: string, data: Data): ErrorMessage | null {
  if (email === '') {
    return createError('Email is empty');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (findUserbyEmail(email, data) !== null) {
    return createError('Email is currently used by another user');
  } else {
    return null;
  }
}

/**
 * Check if the email is valid for adminAuthLogin
 * Returns null if the email is valid, otherwise returns an error object
 */
export function isValidLoginEmail(email: string, data: Data): ErrorMessage | null {
  if (email === '') {
    return createError('Email is empty');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (findUserbyEmail(email, data) === null) {
    return createError('Email does not exist');
  } else {
    return null;
  }
}

/**
 * Check if the email is valid for adminUserDetailsUpdate
 * Returns null if the email is valid, otherwise returns an error object
 */
export function isValidUserEmail(email: string, data: Data, authUserId: number): ErrorMessage | null {
  if (email === '') {
    return createError('Email is empty');
  } else if (!validator.isEmail(email)) {
    return createError('Email is invalid');
  } else if (findUserbyEmail(email, data) !== null && findUserbyEmail(email, data).authUserId !== authUserId) {
    return createError('Email is currently used by another user');
  } else {
    return null;
  }
}

/**
 * Check if the authUserId is valid
 * Returns null if the authUserId is valid, otherwise returns an error object
 */
export function isValidAuthUserId(authUserId: number, data: Data): ErrorMessage | null {
  if (findUserbyId(authUserId, data) === undefined) {
    return createError('AuthUserId is not a valid user');
  }
  return null;
}

/// //////////////////////////////////// QUIZZES ///////////////////////////////////////
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
  // Check if the name is already used by another quiz and that the quiz with the same name is valid
  if (userQuizzes.some(quiz => quiz.valid === true && quiz.name === name)) {
    return createError('Name is already used by another quiz');
  }

  return null;
}

/**
 * Check if the quizId is valid for the given authUserId (assuming authUserId is valid and exists)
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
  if (!findQuizbyId(quizId, data)) {
    return createError('QuizId is not a valid quiz');
  } else if (authUserId !== findQuizbyId(quizId, data).authUserId) {
    return createError('User is not an owner of this quiz');
  } else {
    return null;
  }
}

/**
 * Generate a random colour
 */
export function generateRandomColour(): string {
  const colours = [
    'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown', 'cyan', 'magenta', 'teal', 'lime', 'indigo',
  ];
  return colours[Math.floor(Math.random() * colours.length)];
}

/**
 * Check if the questionId is valid for the given quiz
 * Returns null if the questionId is valid, otherwise returns an error object
 */
export function isValidQuestionIdForQuiz(quiz: Quiz, questionId: number): ErrorMessage | null {
  if (quiz.questions.find(question => question.questionId === questionId) === undefined) {
    return createError('QuestionId is not a valid question');
  }
  return null;
}

/**
 * Check if the quiz question is valid
 * Question is invalid if:
 * 1. Question string is less than 5 characters in length or greater than 50 characters in length
 * 2. The question has more than 6 answers or less than 2 answers
 * 3. The question duration is not a positive number
 * 4. The sum of the question durations in the quiz exceeds 3 minutes
 * 5. The points awarded for the question are less than 1 or greater than 10
 * 6. The length of any answer is shorter than 1 character long, or longer than 30 characters long
 * 7. Any answer strings are duplicates of one another (within the same question)
 * 8. There are no correct answers
 */
export function isValidQuestion(quiz: Quiz, question: QuestionBodyInput): ErrorMessage | null {
  if (question.question.length < 5 || question.question.length > 50) {
    return createError('Question string is not between 5 and 50 characters');
  } else if (question.answers.length < 2 || question.answers.length > 6) {
    return createError('Question has less than 2 or more than 6 answers');
  } else if (question.duration <= 0) {
    return createError('Question duration is not a positive number');
  } else if (question.duration > 180) {
    return createError('Question duration exceeds 3 minutes');
    // Check if the sum of the question durations in the quiz exceeds 3 minutes if updated (accounting for the current question's duration)
  } else if (quiz.questions.reduce((acc, q) => acc + q.duration, 0) + question.duration > 180) {
    return createError('Question duration exceeds 3 minutes if updated');
  } else if (question.points < 1 || question.points > 10) {
    return createError('Question points are not between 1 and 10');
  } else if (question.answers.some(answer => answer.answer.length < 1 || answer.answer.length > 30)) {
    return createError('Answer is not between 1 and 30 characters');
  } else if (question.answers.some(answer => question.answers.filter(a => a.answer === answer.answer).length > 1)) {
    return createError('Duplicate answers in the question');
  } else if (!question.answers.some(answer => answer.correct === true)) {
    return createError('No correct answers in the question');
  } else {
    return null;
  }
}

/**
 * Return index of particular questionId
 */
export function findQuestionIndex(data: Data, quizId: number, questionId: number): number {
  const quiz: Quiz | undefined = data.quizzes.find(q => q.quizId === quizId);
  return quiz.questions.findIndex(q => q.questionId === questionId);
}
