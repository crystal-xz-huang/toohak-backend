// ====================================================================
//  CONSTANTS
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

// ====================================================================
//  GLOBALS
// ====================================================================
export type EmptyObject = Record<string, never>;

export type ErrorMessage = {
  error: string;
};

// ====================================================================
// ADMIN AUTH FUNCTIONS
// ====================================================================
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

// ====================================================================
// ADMIN QUIZ
// ====================================================================
type QuizDetails = {
  quizId: number;
  name: string;
};

type AnswerBody = {
  answerId: number;
  answer: string;
  colour: string;
  correct: boolean;
}

type QuestionBody = {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswerBody[];
}

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
  thumbnailUrl: string;
}

export type AdminQuizTrashViewReturn = {
  quizzes: QuizDetails[];
}

export type QuestionBodyInput = {
  question: string;
  duration: number;
  points: number;
  answers: Array<{ answer: string; correct: boolean }>;
  thumbnailUrl: string;
}

export type AdminQuizQuestionCreateReturn = {
  questionId: number;
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

export type QuizMetadata = {
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

// ====================================================================
// PLAYER
// ====================================================================
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
  thumbnailUrl: string;
  points: number;
  answers: PlayerQuestionAnswerBody[];
}

export type PlayerQuestionResultsReturn = {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
}

export type PlayerFinalResultsReturn = {
  usersRankedByScore: UserScore[];
  questionResults: PlayerQuestionResultsReturn[];
}

export type UserScore = {
  name: string;
  score: number;
}

export type PlayerChatListReturn = {
  messages: PlayerChatMessage[];
}

type PlayerChatMessage = {
  messageBody: string;
  playerId: number;
  playerName: string;
  timeSent: number;
}

export type ChatMessage = {
  messageBody: string;
}
