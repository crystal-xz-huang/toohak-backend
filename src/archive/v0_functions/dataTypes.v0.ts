/**
 * List of all types and interfaces used in the project
 * NOTE: Types vs Interfaces
 * - Types cannot be extended or modified after declaration
 * - Interfaces can be extended and re-opened to add new properties
 */

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

export type AnswerBody = {
  answerId: number;
  answer: string;
  colour: string; // randomly generated colour
  correct: boolean;
}

export type QuestionBody = {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl?: string;
  points: number;
  answers: AnswerBody[];
}

export type Quiz = {
  quizId: number;
  name: string;
  authUserId: number; // the id of the user who created the quiz
  description: string;
  timeCreated: number; // Unix timestamp in seconds: Math.floor(Date.now() / 1000)
  timeLastEdited: number; // Unix timestamp in seconds: Math.floor(Date.now() / 1000)
  numQuestions: number;
  questions: QuestionBody[];
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

export type Error = {
  statusCode: number;
  error: string;
};

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
  questions: QuestionBody[];
  duration: number;
}

export type AdminQuizTrashViewReturn = {
  quizzes: QuizDetails[];
}

export type AdminQuizQuestionCreateReturn = {
  questionId: number;
}

export type QuestionBodyInput = {
  question: string;
  duration: number;
  points: number;
  answers: Array<{ answer: string; correct: boolean }>;
}

export type AdminQuizQuestionDuplicateReturn = {
  newQuestionId: number;
}

export type AdminQuizSessionListReturn = {
  activeSessions: number[],
  inactiveSessions: number[],
}

export type AdminQuizSessionStartReturn = {
  sessionId: number;
}

type QuizMetadata = {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: QuestionBody[];
  duration: number;
  thumbnailUrl: string;
}

export type AdminQuizSessionStatusReturn = {
  state: string;
  atQuestion: number;
  players: string[];
  metadata: QuizMetadata;
}

export type AdminQuizSessionResultsReturn = {
  usersRankedByScore: UserScore[];
  questionResults: PlayerQuestionResultsReturn[];
}

export type AdminQuizSessionResultsCSVReturn = {
  url: string;
}

export type PlayerJoinReturn = {
  playerId: number;
}

export type PlayerStatusReturn = {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

type PlayerQuestionAnswerBody = {
  answerId: number;
  answer: string;
  colour: string;
}

export type PlayerQuestionInfoReturn = {
  questionId: number;
  question: string;
  duration: number;
  points: number;
  answers: PlayerQuestionAnswerBody[];
}

export type PlayerQuestionAnswerReturn = {
  answerIds: number[];
}

export type PlayerQuestionResultsReturn = {
  questionId: number;
  playersCorrectList: string[]; // array of strings in ascending order
  averageAnswerTime: number;
  percentCorrect: number;
}

type UserScore = {
  name: string;
  score: number;
}

export type PlayerFinalResultsReturn = {
  usersRankedByScore: UserScore[];
  questionResults: PlayerQuestionResultsReturn[];
}

type PlayerChatMessage = {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export type PlayerChatListReturn = {
  messages: PlayerChatMessage[];
}

export type ChatMessage = {
  messageBody: string;
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

// STATUS CODES
export const BAD_REQUEST_CODE = 400;
export const UNAUTHORISED_CODE = 401;
export const FORBIDDEN_CODE = 403;
