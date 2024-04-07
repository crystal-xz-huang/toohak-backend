// ====================================================================
// RETURN CONSTANTS
// ====================================================================
export const BAD_REQUEST_ERROR = { statusCode: 400, jsonBody: expect.any(String) };
export const UNAUTHORISED_ERROR = { statusCode: 401, jsonBody: expect.any(String) };
export const FORBIDDEN_ERROR = { statusCode: 403, jsonBody: expect.any(String) };

export const CLEAR_SUCCESS = { statusCode: 200, jsonBody: {} };
export const TOKEN_SUCCESS = { statusCode: 200, jsonBody: { token: expect.any(String) } };
export const QUIZLIST_SUCCESS = { statusCode: 200, jsonBody: { quizzes: expect.any(Array) } };

// ====================================================================
// USER CONSTANTS
// ====================================================================
export const user1 = {
  email: 'johnsmith@gmail.com',
  password: 'hashed_password1',
  nameFirst: 'John',
  nameLast: 'Smith',
};

export const user2 = {
  email: 'janedoe@gmail.com',
  password: 'hashed_password2',
  nameFirst: 'Jane',
  nameLast: 'Doe',
};

export const user3 = {
  email: 'hayden.smith@unsw.edu.au',
  password: 'haydensmith123',
  nameFirst: 'Hayden',
  nameLast: 'Smith',
};

export const invalidEmails = [
  { email: '' },
  { email: 'example.com' },
  { email: 'example@' },
  { email: 'example@.com' },
  { email: '@gmail.com' },
  { email: 'hello@gmail@gmail.com' },
  { email: 'email' },
];

export const invalidPasswords = [
  { password: '12345678' },
  { password: 'abcdefghi' },
];

// ====================================================================
// QUIZ CONSTANTS
// ====================================================================
export const quiz1 = {
  name: 'Quiz 1',
  description: 'This is a quiz',
};

export const quiz2 = {
  name: 'Quiz 2',
  description: 'This is another quiz',
};

export const quiz3 = {
  name: 'Quiz 3',
  description: 'This is yet another quiz',
};

export const shortQuizNames = [
  { name: '' },
  { name: 'a' },
  { name: 'ab' },
];

export const invalidQuizNames = [
  { name: '' },
  { name: 'a' },
  { name: 'ab' },
  { name: 'Quiz 1&!' },
  { name: 'a'.repeat(31) },
];

export const invalidQuizDescription = 'a'.repeat(101); // more than 100 characters

export const validQuestion1 = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
  ]
};

export const validQuestion2 = {
  question: 'What is the capital of Australia?',
  duration: 3,
  points: 5,
  answers: [
    { answer: 'Canberra', correct: true },
    { answer: 'Sydney', correct: false },
  ]
};

export const validQuestion3 = {
  question: 'What is the capital of France?',
  duration: 2,
  points: 5,
  answers: [
    { answer: 'Paris', correct: true },
    { answer: 'Lyon', correct: false },
  ]
};

export const validQuestion4 = {
  question: 'What is the capital of Japan?',
  duration: 1,
  points: 5,
  answers: [
    { answer: 'Tokyo', correct: true },
    { answer: 'Osaka', correct: false },
  ]
};

export const validQuestion5 = {
  question: 'What is the capital of China?',
  duration: 5,
  points: 5,
  answers: [
    { answer: 'Beijing', correct: true },
    { answer: 'Shanghai', correct: false },
  ]
};
// Question string is less than 5 characters in length
export const shortQuestionString = [
  {
    question: '',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false },
    ]
  },
  {
    question: 'a'.repeat(4),
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
];

// Question string is greater than 50 characters in length
export const longQuestionString = {
  question: 'a'.repeat(51),
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
  ]
};

// Question has more than 6 answers
export const moreQuestionAnswers = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
    { answer: 'Prince Andrew', correct: false },
    { answer: 'Princess Anne', correct: false },
    { answer: 'Prince Edward', correct: false },
  ]
};

// Question has less than 2 answers
export const lessQuestionAnswers = [
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [],
  },
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
    ]
  },
];

// Question duration is not a positive number
export const negativeQuestionDuration = [
  {
    question: 'Who is the Monarch of England?',
    duration: 0,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'Who is the Monarch of England?',
    duration: -1,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
];

// Sum of the question durations in the quiz exceeds 3 minutes
export const moreQuestionDurationSum = [
  {
    question: 'Who is the Monarch of England?',
    duration: 60,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Queen Elizabeth II', correct: false },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'What is the capital of Australia?',
    duration: 121,
    points: 5,
    answers: [
      { answer: 'Canberra', correct: true },
      { answer: 'Sydney', correct: false },
      { answer: 'Melbourne', correct: false },
      { answer: 'Brisbane', correct: false },
    ]
  },
];

// Points awarded for the question is less than 1
export const lessQuestionPoints = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 0,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
  ]
};

// Points awarded for the question is greater than 10
export const moreQuestionPoints = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 11,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
  ]
};

// Length of any answer is shorter than 1 character long
export const shortQuestionAnswers = [
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: '', correct: true },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: '', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince William', correct: false },
      { answer: '', correct: false },
    ]
  },
];

// Length of any answer is longer than 30 characters long
export const longQuestionAnswers = [
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'a'.repeat(31), correct: true },
      { answer: 'Prince William', correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'a'.repeat(31), correct: false },
      { answer: 'Prince Harry', correct: false },
    ]
  },
  {
    question: 'Who is the Monarch of England?',
    duration: 4,
    points: 5,
    answers: [
      { answer: 'Prince Charles', correct: true },
      { answer: 'Prince William', correct: false },
      { answer: 'a'.repeat(31), correct: false },
    ]
  },
];

// Any answer strings are duplicates of one another (within the same question)
export const duplicateQuestionAnswers = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Prince Charles', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince William', correct: false },
  ]
};

// There are no correct answers
export const falseQuestionAnswers = {
  question: 'Who is the Monarch of England?',
  duration: 4,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: false },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
  ]
};
