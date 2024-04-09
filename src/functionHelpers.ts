import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import crypto from 'crypto';
import { ErrorMessage, QuestionBodyInput } from './functionTypes';
import {
  Data,
  User,
  Quiz,
  MIN_USER_NAME_LENGTH,
  MAX_USER_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  USERNAME_REGEX,
  PASSWORD_REGEX,
  MIN_QUIZ_NAME_LENGTH,
  MAX_QUIZ_NAME_LENGTH,
  QUIZNAME_REGEX,
  MAX_QUIZ_DESCRIPTION_LENGTH,
  URL_PROTOCOL,
  URL_FILETYPE,
} from './dataTypes';

/// ////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////  GENERATE FUNCTIONS  ////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////
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
 * Generates a token for a new session (unique string each time)
 */
export function generateToken(): string {
  return uuidv4();
}

/**
 * Generate a random 6-digit number
 */
export function generateRandomNumber(): number {
  return Math.floor(Math.random() * 900000) + 100000;
}

/// ////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////  GET FUNCTIONS  ////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////
/**
 * Returns the Unix timestamp in seconds
 */
export function getCurrentTime(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Hashes a string using SHA256
 */
export function getHashOf(plaintext: string): string {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

// /**
//  * Returns the index of the quiz with the given quizId's in data.quizzes array
//  * Otherwise, returns null if the quiz is not found
//  *
//  * @param { number}  quizId
//  * @param { object } data - the data object from getData()
//  * @returns { number | null } - the index of the quiz in data.quizzes array
//  */
// export function getQuizIndex(quizId: number, data: Data): number | null {
//   const index = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
//   if (index === -1) {
//     return null;
//   }
// }

/// ////////////////////////////////////////////////////////////////////////////////////
/// //////////////////////////  FIND FUNCTIONS  ////////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////

/**
 * Given a token, returns the user associated with the token
 * If the token refers to a VALID session, returns the user object
 * Otherwise, returns undefined
 */
export function findUserbyToken(token: string, data: Data): User | undefined {
  const userSession = data.userSessions.find(session => session.token === token && session.valid);
  return data.users.find(user => user.authUserId === userSession.authUserId);
}

/**
 * Given a registered user's email, returns the user object
 * Otherwise, returns undefined if the email is not found
*/
export function findUserbyEmail(email: string, data: Data): User {
  return data.users.find(user => user.email === email);
}

/**
 * Return index of particular questionId
 */
export function findQuestionIndex(data: Data, quizId: number, questionId: number): number {
  const quiz: Quiz | undefined = data.quizzes.find(q => q.quizId === quizId);
  return quiz.questions.findIndex(q => q.questionId === questionId);
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

/// ////////////////////////////////////////////////////////////////////////////////////
/// ////////////////////////  IS VALID FUNCTIONS  //////////////////////////////////////
/// ////////////////////////////////////////////////////////////////////////////////////

function createError(message: string): ErrorMessage {
  return { error: message };
}

/**
 * Given a token, returns an error message if the token is invalid (does not refer to a valid logged-in session)
 * Otherwise, returns null
 */
export function isValidToken(token: string, data: Data): ErrorMessage | null {
  if (token === '') {
    return createError('Token is empty');
  }
  const session = data.userSessions.find(session => session.token === token);
  if (session === undefined || session.valid === false) {
    return createError('Invalid token');
  }
  return null;
}

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
  } else if (findUserbyEmail(email, data)) {
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
  } else if (!findUserbyEmail(email, data)) {
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
  } else if (findUserbyEmail(email, data) && findUserbyEmail(email, data).authUserId !== authUserId) {
    return createError('Email is currently used by another user');
  } else {
    return null;
  }
}

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
 * Check if quiz name is already used by another valid quiz for the same user
 * Returns null if the name is not used, otherwise returns an error object
 *
 * @param { string } name - the name of the quiz
 * @param { number } authUserId - the id of registered user
 * @returns { ErrorMessage | null } - error message if invalid, or null if valid
 */
export function isQuizNameUsed(name: string, authUserId: number, data: Data): ErrorMessage | null {
  const userQuizzes = data.quizzes.filter(quiz => quiz.authUserId === authUserId && quiz.valid);
  if (userQuizzes.some(quiz => quiz.name === name)) {
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
 * Check if thumbnailURL is a valid URL
 * Invalid if:
 * - an empty string
 * - does not end with one of the following filetypes (case insensitive): jpg, jpeg, png
 * - does not begin with 'http://' or 'https://'
 */
export function isValidImgURL(url: string): ErrorMessage | null {
  if (url === '') {
    return createError('URL is empty');
  } else if (!URL_FILETYPE.test(url)) {
    return createError('URL does not end with a valid filetype');
  } else if (!URL_PROTOCOL.test(url)) {
    return createError('URL does not begin with http:// or https://');
  }
  // else if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true, require_valid_protocol: true })) {
  //   return createError('URL is not a valid URL');
  // }
  return null;
}

// export function isValidSessionIdforQuiz(quizId: number, sessionId: number, data: Data): ErrorMessage | null {
//   const session = data.quizSessions
//     .filter((s) => s.metadata.quizId === quizId)
//     .find((s) => s.sessionId === sessionId);

//   if (!session) {
//     return createError('SessionId does not refer to a valid session within the quiz');
//   }
// }
