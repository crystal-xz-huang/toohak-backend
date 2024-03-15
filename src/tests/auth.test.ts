import { YAMLParseError } from 'yaml';
import {
  authRegisterV1,
  authLoginV1,
  userDetailsV1,
  userDetailsUpdateV1,
  userPasswordUpdateV1,
  clearV1,
} from './testHelpers';


const ERROR = {
  statusCode: 400,
  jsonBody: { error: expect.any(String) }
};


const TOKEN_SUCCESS = { 
  statusCode: 200,
  jsonBody: { token: expect.any(String) }
};

const user1 = {
  email: 'johnsmith@gmail.com',
  password: 'hashed_password1',
  nameFirst: 'John',
  nameLast: 'Smith',
};

const user2 = {
  email: 'janedoe@gmail.com',
  password: 'hashed_password2',
  nameFirst: 'Jane',
  nameLast: 'Doe',
};

const user3 = {
  email: 'hayden@gmail.com',
  password: 'hashed_password3',
  nameFirst: 'Hayden',
  nameLast: 'Smith',
};

const invalidEmails = [
  { email: '' },
  { email: 'example.com' },
  { email: 'example@' },
  { email: 'example@.com' },
  { email: '@gmail.com' },
  { email: 'hello@gmail@gmail.com' },
  { email: 'email' },
];

const invalidPasswords = [
  { password: '12345678' },
  { password: 'abcdefgh' },
];

// ========================================================================================================================================
beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Correct status code and return value on success', () => {
    const result = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
    expect(result).toStrictEqual(TOKEN_SUCCESS);
  });

  test('Register and login a user with the correct details', () => {
    const result = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    expect(userDetailsV1(result.token)).toStrictEqual({
      user: {
        userId: result.token,
        name: `${user1.nameFirst} ${user1.nameLast}`,
        email: user1.email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Token is unique for each user', () => {
    const result1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    const result2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    const result3 = authRegisterV1(user3.email, user3.password, user3.nameFirst, user3.nameLast).jsonBody;
    expect(result1.token).not.toStrictEqual(result2.token);
    expect(result2.token).not.toStrictEqual(result3.token);
    expect(result3.token).not.toStrictEqual(result1.token);
  });

  describe('Error with an invalid email', () => {
    test.each(invalidEmails)("Invalid email '$#': '$email'", ({ email }) => {
      expect(authRegisterV1(email, user1.password, user1.nameFirst, user1.nameLast)).toStrictEqual(ERROR);
    });

    test('Test already used email', () => {
      authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
      const result = authRegisterV1(user1.email, user2.nameFirst, user2.nameLast, user2.password);
      expect(result).toStrictEqual(ERROR);
    });
  });

  describe('Error with an invalid first name', () => {
    test('First name contains invalid characters', () => {
      expect(authRegisterV1(user1.email, user1.password, 'Jane@.#7123', user1.nameLast)).toStrictEqual(ERROR);
    });

    test('First name is less than 2 characters', () => {
      expect(authRegisterV1(user1.email, user1.password, 'J', user1.nameLast)).toStrictEqual(ERROR);
    });

    test('First name is empty', () => {
      expect(authRegisterV1(user1.email, user1.password, '', user1.nameLast)).toStrictEqual(ERROR);
    });

    test('First name is more than 20 characters', () => {
      expect(authRegisterV1(user1.email, user1.password, 'JaneJaneJaneJaneJaneJ', user1.nameLast)).toStrictEqual(ERROR);
    });
  });

  describe('Error with an invalid last name', () => {
    test('Last name contains invalid characters', () => {
      expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, 'Doe12*&^')).toStrictEqual(ERROR);
    });

    test('Last name is less than 2 characters', () => {
      expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, 'D')).toStrictEqual(ERROR);
    });

    test('Last name is empty', () => {
      expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, '')).toStrictEqual(ERROR);
    });

    test('Last name is more than 20 characters', () => {
      expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(ERROR);
    });
  });

  describe('Error with an invalid password', () => {
    test('Password is less than 8 characters', () => {
      expect(authRegisterV1(user1.email, 'abc4567', user1.nameFirst, user1.nameLast)).toStrictEqual(ERROR);
    });

    test('Password is empty', () => {
      expect(authRegisterV1(user1.email, '', user1.nameFirst, user1.nameLast)).toStrictEqual(ERROR);
    });

    test.each(invalidPasswords)('Password does not contain at least one number and one letter', ({ password }) => {
      expect(authRegisterV1(user1.email, password, user1.nameFirst, user1.nameLast)).toStrictEqual(ERROR);
    });
  });
});

// describe('Testing POST /v1/admin/auth/login', () => {
//   let result;
//   beforeEach(() => {
//     result = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).
//   });

//   test('Correct status code and return value', () => {
//     expect(authLoginV1(user1.email, user1.password)).toStrictEqual(TOKEN_SUCCESS);
//   });

//   test('Login in a user with the correct details', () => {
//     const token = authLoginV1(user1.email, user1.password).jsonBody.token;
//     expect(userDetailsV1(token)).toStrictEqual({
//       user: {
//         userId: token,
//         name: `${user1.nameFirst} ${user1.nameLast}`,
//         email: user1.email,
//         numSuccessfulLogins: 1,
//         numFailedPasswordsSinceLastLogin: 0,
//       }
//     });
//   });

//   test('Error when email does not exist', () => {
//     expect(authLoginV1('unregistered@gmail.com', user1.password)).toStrictEqual(ERROR);
//   });

//   test('Error when password is not correct', () => {
//     expect(authLoginV1(user1.email, 'incorrect_password')).toStrictEqual(ERROR);
//   });
// });
