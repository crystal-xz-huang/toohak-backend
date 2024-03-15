// ====================================================================
// RETURN CONSTANTS
// ====================================================================
export const ERROR = { statusCode: 400, error: expect.any(String) };
export const CLEAR_SUCCESS = { statusCode: 200, jsonBody: {} };
export const TOKEN_SUCCESS = { statusCode: 200, jsonBody: { token: expect.any(String) } };

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
  { password: 'abcdefgh' },
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

export const invalidQuizNames = [
  { name: '' },              // empty string
  { name: 'Quiz 1&!' },      // contains invalid characters
  { name: 'ab' },            // too short (less than 3 characters)
  { name: 'a'.repeat(31) },  // too long  (more than 30 characters)
];

export const invalidQuizDescriptions = 'a'.repeat(101); // more than 100 characters
