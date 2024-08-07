// ====================================================================
// RETURN CONSTANTS
// ====================================================================
export const BAD_REQUEST_ERROR = { statusCode: 400, error: expect.any(String) };
export const UNAUTHORISED_ERROR = { statusCode: 401, error: expect.any(String) };
export const FORBIDDEN_ERROR = { statusCode: 403, error: expect.any(String) };

export const OK_SUCCESS = { statusCode: 200, jsonBody: expect.anything() };
export const TOKEN_SUCCESS = { statusCode: 200, jsonBody: { token: expect.any(String) } };

// ====================================================================
// USER CONSTANTS
// ====================================================================
export const USER1 = {
  email: 'johnsmith@gmail.com',
  password: 'hashed_password1',
  nameFirst: 'John',
  nameLast: 'Smith',
};

export const USER2 = {
  email: 'janedoe@gmail.com',
  password: 'hashed_password2',
  nameFirst: 'Jane',
  nameLast: 'Doe',
};

export const USER3 = {
  email: 'hayden.smith@unsw.edu.au',
  password: 'haydensmith123',
  nameFirst: 'Hayden',
  nameLast: 'Smith',
};

export const INVALID_EMAILS = [
  { email: '' },
  { email: 'example.com' },
  { email: 'example@' },
  { email: 'example@.com' },
  { email: '@gmail.com' },
  { email: 'hello@gmail@gmail.com' },
  { email: 'email' },
];

export const INVALID_PASSWORDS = [
  { password: '12345678' },
  { password: 'abcdefghi' },
];

// ====================================================================
// QUIZ CONSTANTS
// ====================================================================
export const QUIZ1 = {
  name: 'Quiz 1',
  description: 'This is a quiz',
};

export const QUIZ2 = {
  name: 'Quiz 2',
  description: 'This is another quiz',
};

export const QUIZ3 = {
  name: 'Quiz 3',
  description: 'This is yet another quiz',
};

export const SHORT_QUIZ_NAMES = [
  { name: '' },
  { name: 'a' },
  { name: 'ab' },
];

export const INVALID_QUIZ_NAMES = [
  { name: '' },
  { name: 'a' },
  { name: 'ab' },
  { name: 'Quiz 1&!' },
  { name: 'a'.repeat(31) },
];

// Question string is less than 5 characters in length
export const SHORT_QUESTION_STRING = [
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
export const LONG_QUESTION_STRING = {
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
export const MORE_QUESTION_ANSWERS = {
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
export const LESS_QUESTION_ANSWERS = [
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
export const NEGATIVE_QUESTION_DURATION = [
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

export const LONG_QUESTION_DURATION = {
  question: 'Who is the Monarch of England?',
  duration: 181,
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
    { answer: 'Prince William', correct: false },
    { answer: 'Prince Harry', correct: false },
  ]
};

// Sum of the question durations in the quiz exceeds 3 minutes
export const MORE_QUESTION_DURATION_SUM = [
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
export const LESS_QUESTION_POINTS = {
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
export const MORE_QUESTION_POINTS = {
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
export const SHORT_QUESTION_ANSWERS = [
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
export const LONG_QUESTION_ANSWERS = [
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
export const DUPLICATE_QUESTION_ANSWERS = {
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
export const FALSE_QUESTION_ANSWERS = {
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

//= ====================================================================
// NEW QUESTION BODY FOR ITERATION 3
//= ====================================================================
export const QUESTION_BODY1 = {
  question: 'Who is the Monarch of England?',
  duration: 4, // 4 seconds
  points: 5,
  answers: [
    { answer: 'Prince Charles', correct: true },
    { answer: 'Queen Elizabeth II', correct: false },
  ],
  thumbnailUrl: 'http://google.com/some/image/path.jpg'
};

export const QUESTION_BODY2 = {
  question: 'What is the capital of Australia?',
  duration: 10,
  points: 5,
  answers: [
    { answer: 'Canberra', correct: true },
    { answer: 'Sydney', correct: false },
  ],
  thumbnailUrl: 'https://google.com/some/image/path.jpg'
};

export const QUESTION_BODY3 = {
  question: 'What is the capital of France?',
  duration: 2,
  points: 5,
  answers: [
    { answer: 'Paris', correct: true },
    { answer: 'Lyon', correct: false },
  ],
  thumbnailUrl: 'https://google.com/some/image/path.jpeg'
};

export const QUESTION_BODY4 = {
  question: 'What is the capital of Japan?',
  duration: 4,
  points: 7,
  answers: [
    { answer: 'Tokyo', correct: true },
    { answer: 'Osaka', correct: false },
  ],
  thumbnailUrl: 'https://google.com/some/image/path.png'
};

export const QUESTION_BODY5 = {
  question: 'What is the square root of 16?',
  duration: 6,
  points: 7,
  answers: [
    { answer: '4', correct: true },
    { answer: '4.0', correct: true },
    { answer: '2', correct: false },
    { answer: '8', correct: false },
  ],
  thumbnailUrl: 'https://google.com/some/image/path.png'
};

// does not end with one of the following filetypes (case insensitive): jpg, jpeg, png
// does not begin with 'http://' or 'https://'
export const INVALID_IMG_URLS = [
  '',
  'google.com/some/image/path.jpg',
  'http://google.com/some/image/path',
  'http://google.com/some/image/path.gif',
  'https://google.com/some/image/path',
  'https://google.com/some/image/path.gif',
  'www.google.com/some/image/path.jpg',
  'http:google.com/some/image/path.jpg',
  'https:google.com/some/image/path.jpg',
  'HTTP://google.com/some/image/path.jpg',
  'HTTPS://google.com/some/image/path.jpg',
];

// ====================================================================
// PLAYER CONSTANTS
// ====================================================================

// Valid names
export const PLAYER_BODY1 = {
  name: 'John Smith'
};

export const PLAYER_BODY2 = {
  name: 'Joe Doe'
};

export const PLAYER_BODY3 = {
  name: 'Hayden Smith'
};

export const MESSAGE1 = {
  messageBody: 'This is a message'
};

export const MESSAGE2 = {
  messageBody: 'This is another message'
};

export const MESSAGE3 = {
  messageBody: 'This is yet another message'
};
