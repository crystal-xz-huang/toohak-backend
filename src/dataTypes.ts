// ====================================================================
// DATA STORE
// ====================================================================

export interface Data {
  users: User[];
  quizzes: Quiz[];
  userSessions: UserSession[];
  quizSessions: QuizSession[];
  players: Player[];
  messages: Message[];
}

// ====================================================================
// USER TYPES
// ====================================================================
export interface User {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
}

export interface UserSession {
  authUserId: number;
  token: string;
  valid: boolean;
}

export interface Quiz {
  quizId: number;
  name: string;
  authUserId: number; // the id of the user who created the quiz
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  numQuestions: number;
  questions: QuestionBody[];
  duration: number;
  thumbnailUrl: string;
  valid: boolean; // false if the quiz has been moved to the trash
}

interface QuestionBody {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswerBody[];
}

interface AnswerBody {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

export interface QuizSession {
  sessionId: number;
  autoStartNum: number; // number of players needed to auto start the quiz
  state: State, // the current state of the quiz session
  atQuestion: number; // the question the quiz session is currently at
  metadata: Quiz; // a copy of the quiz being played
  questionCountDown?: NodeJS.Timeout;
  questionDuration?: NodeJS.Timeout;
}

interface Player {
  playerId: number;
  sessionId: number;
  name: string;
  score: number;
}

interface Message {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

/*
interface AnswerSubmission {
  playerId: number;
  questionId: number;
  answerIds: number[];
  answerTime: number;
}

interface Result {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}
*/

export enum State {
  LOBBY = 'LOBBY', // players can join
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN', // countdown to question open
  QUESTION_OPEN = 'QUESTION_OPEN', // question is open for viewing and answering
  QUESTION_CLOSE = 'QUESTION_CLOSE', // question is closed for answering (still open for viewing)
  ANSWER_SHOW = 'ANSWER_SHOW', // correct answers are shown
  FINAL_RESULTS = 'FINAL_RESULTS', // final results are shown
  END = 'END', // quiz session has ended (inactive state)
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
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

// URLS
export const URL_PROTOCOL = /^(http|https):\/\//;
export const URL_FILETYPE = /\.(jpg|jpeg|png)$/i;
