/**
 * List of all types and interfaces used in the project
 * NOTE: Types vs Interfaces
 * - Types cannot be extended or modified after declaration
 * - Interfaces can be extended and re-opened to add new properties
 */

/*********************************************************************
 * TOKENS - Used by the client to identify their session to the server
 * SESSIONS - Used by the server to identify the client's session
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
/*********************************************************************/

// ====================================================================
// DATA STORE TYPES
// ====================================================================
export type Data = {
  users: User[];
  quizzes: Quiz[];
  sessions: Session[];
  userId_counter: number;
  quizId_counter: number;
  sessionId_counter: number;
}

export type User = {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export type Question = {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: [
    {
      answerId: number;
      answer: string;
      colour: string;
      correct: boolean;
    }
  ];
}

export type Quiz = {
  quizId: number;
  name: string;
  authUserId: number; // the id of the user who created the quiz
  description: string;
  timeCreated: number; // Unix timestamp in seconds: Math.floor(Date.now() / 1000)
  timeLastEdited: number; // Unix timestamp in seconds: Math.floor(Date.now() / 1000)
  numQuestions: number;
  questions: Question[];
  duration: number;
  valid: boolean; // false if the quiz has been moved to the trash
}

export type Session = {
  token: string; // the session token (identifies the session)
  sessionId: number;
  adminUserId: number; // the user id of the admin user
  valid: boolean; // true if the session is logged in
}



// ====================================================================
// GLOBAL TYPES
// ====================================================================

export type EmptyObject = Record<string, never>;

export type Token = {
  token: string;
}

// ====================================================================
// RETURN TYPES - POST REQUESTS
// ====================================================================

export type ErrorMessage = {
  error: string;
};

export type AdminAuthRegisterReturn = {
  token: string;
};

export type AdminAuthLoginReturn = {
  token: string;
};

export type AdminUserDetailsReturn = {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
};

export type QuizDetails = {
  quizId: number;
  name: string;
};

export type AdminQuizListReturn = {
  quizzes: QuizDetails[];
};

export type AdminQuizCreateReturn = {
  quizId: number;
}

export type AdminQuizInfoReturn = {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: Question[];
  duration: number;
}

// ====================================================================
// CONSTANTS
// ====================================================================

// USERS
export const MIN_USER_NAME_LENGTH = 2;
export const MAX_USER_NAME_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z\s'-]+$/;

// PASSWORDS
export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-zA-Z]).*$/;

// QUIZZES
export const MIN_QUIZ_NAME_LENGTH = 3;
export const MAX_QUIZ_NAME_LENGTH = 30;
export const QUIZNAME_REGEX = /^[a-zA-Z0-9\s]+$/;
export const MAX_QUIZ_DESCRIPTION_LENGTH = 100;
