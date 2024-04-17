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
// USER INTERFACES
// ====================================================================
export interface User {
  authUserId: number;
  email: string;
  password: string;
  nameFirst: string;
  nameLast: string;
  numSuccessfulLogins: number;
  numFailedPasswordsSinceLastLogin: number;
  usedPasswords: string[];
}

export interface UserSession {
  authUserId: number;
  token: string;
  valid: boolean;
}
// ====================================================================
// QUIZ INTERFACES
// ====================================================================
export interface Quiz {
  quizId: number;
  name: string;
  authUserId: number;
  description: string;
  timeCreated: number;
  timeLastEdited: number;
  numQuestions: number;
  questions: QuestionBody[];
  duration: number;
  thumbnailUrl: string;
  valid: boolean;
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
  autoStartNum: number;
  state: State,
  atQuestion: number;
  metadata: QuizMetadata;
}

export interface QuizMetadata {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
  numQuestions: number;
  questions: SessionQuestionBody[];
  duration: number;
  thumbnailUrl: string;
}

export interface SessionQuestionBody {
  questionId: number;
  question: string;
  duration: number;
  thumbnailUrl: string;
  points: number;
  answers: AnswerBody[];
  timeOpen: number;
  playerCorrectList: PlayerInfo[];
  playerAnswers: PlayerAnswer[];
}

export interface PlayerAnswer {
  playerId: number;
  answerTime: number;
}

export interface PlayerInfo {
  playerId: number;
  name: string;
  submittedTime: number;
}

// ====================================================================
// PLAYER INTERFACES
// ====================================================================
export interface Player {
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

export enum State {
  LOBBY = 'LOBBY',
  QUESTION_COUNTDOWN = 'QUESTION_COUNTDOWN',
  QUESTION_OPEN = 'QUESTION_OPEN',
  QUESTION_CLOSE = 'QUESTION_CLOSE',
  ANSWER_SHOW = 'ANSWER_SHOW',
  FINAL_RESULTS = 'FINAL_RESULTS',
  END = 'END',
}

export enum Action {
  NEXT_QUESTION = 'NEXT_QUESTION',
  SKIP_COUNTDOWN = 'SKIP_COUNTDOWN',
  GO_TO_ANSWER = 'GO_TO_ANSWER',
  GO_TO_FINAL_RESULTS = 'GO_TO_FINAL_RESULTS',
  END = 'END',
}
