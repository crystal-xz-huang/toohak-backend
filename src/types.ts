/**
 * List of all types used in the project
 * NOTE: Types vs Interfaces
 * - Types cannot be extended or modified after declaration
 * - Interfaces can be extended and re-opened to add new properties
 */
export type Data = {
  users: User[];
  quizzes: Quiz[];
  userId_counter: number;
  quizId_counter: number;
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

export type Quiz = {
  quizId: number;
  name: string;
  authUserId: number;
  description: string;
  timeCreated: number; // Unix timestamp in seconds
  timeLastEdited: number; // Unix timestamp in seconds
}

export type ErrorMessage = {
  error: string;
}

// return type for adminAuthRegister
export type UserId = {
  authUserId: number;
}

// return type for adminAuthLogin
export type UserDetails = {
  user: {
    userId: number;
    name: string;
    email: string;
    numSuccessfulLogins: number;
    numFailedPasswordsSinceLastLogin: number;
  }
}

// return type for adminQuizCreates
export type QuizId = {
  quizId: number;
}

export type QuizDetails = {
  quizId: number;
  name: string;
}

// return type for adminQuizList
export type QuizList = {
  quizzes: QuizDetails[];
}

// return type for adminQuizInfo
export type QuizInfo = {
  quizId: number;
  name: string;
  timeCreated: number; // Unix timestamp in seconds
  timeLastEdited: number; // Unix timestamp in seconds
  description: string;
}

/**
 * List of all constants used in the project
 * NOTE: Constants are immutable and cannot be modified after declaration
 */

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
