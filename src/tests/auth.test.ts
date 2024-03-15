
import {
  authRegisterV1,
  // authLoginV1,
  // userDetailsV1,
  // userDetailsUpdateV1,
  // userPasswordUpdateV1,
  clearV1,
} from '../testHelpers';

const ERROR = { statusCode: 400, error: expect.any(String) };
const TOKEN_SUCCESS = { statusCode: 200, jsonBody: { token: expect.any(String) } };

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
  email: 'hayden.smith@unsw.edu.au',
  password: 'haydensmith123',
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
    expect(authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast)).toStrictEqual(TOKEN_SUCCESS);
  });

  // test('Registers and logins a user with the correct details', () => {
  //   const result = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
  //   expect(userDetailsV1(result.token)).toStrictEqual({
  //     user: {
  //       userId: result.token, // ?!?!
  //       name: `${user1.nameFirst} ${user1.nameLast}`,
  //       email: user1.email,
  //       numSuccessfulLogins: 1,
  //       numFailedPasswordsSinceLastLogin: 0,
  //     }
  //   });
  // });

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
/*
describe('Testing GET /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token;
  });

  test('returns error when authUserId is invalid', () => {
    expect(userDetailsV1(token + 10)).toStrictEqual(ERROR);
  });

  describe('returns an object with correct key-values when authUserId is valid', () => {
    test('test numSuccessfulLogins is 1 when user is registered with authRegisterV1', () => {
      expect(userDetailsV1(id.authUserId)).toStrictEqual({
        user: {
          userId: id.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test('test numSuccessfulLogins is 2 when user successfully logs in with adminAuthLogin', () => {
      authLoginV1(user.email, user.password);
      expect(userDetailsV1(id.authUserId)).toStrictEqual({
        user: {
          userId: id.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });

    test('test numFailedPasswordsSinceLastLogin is 1 when user fails to log in with an invalid password', () => {
      authLoginV1(user.email, 'invalid_password1');
      expect(userDetailsV1(id.authUserId)).toStrictEqual({
        user: {
          userId: id.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: 1,
          numFailedPasswordsSinceLastLogin: 1,
        }
      });
    });

    test('test numFailedPasswordsSinceLastLogin is reset with a successful login', () => {
      authLoginV1(user.email, 'invalid_password1');
      authLoginV1(user.email, user.password);
      expect(userDetailsV1(id.authUserId)).toStrictEqual({
        user: {
          userId: id.authUserId,
          name: `${user.nameFirst} ${user.nameLast}`,
          email: user.email,
          numSuccessfulLogins: 2,
          numFailedPasswordsSinceLastLogin: 0,
        }
      });
    });
  });
});

describe('Testing PUT /v1/admin/user/details', () => {
  const emailUpdate = 'janedoe@gmail.com';
  const nameFirstUpdate = 'Jane';
  const nameLastUpdate = 'Doe';

  let id;
  beforeEach(() => {
    const ret = authRegisterV1(user.email, user.password, user.nameFirst, user.nameLast);
    id = ret.authUserId;
  });

  test('returns an empty object on success', () => {
    const result = userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, nameLastUpdate);
    expect(result).toStrictEqual({});
  });

  describe('user details are updated on success', () => {
    test('test authUserId is not changed', () => {
      const result = userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, nameLastUpdate);
      expect(result).toStrictEqual({});
      expect(userDetailsV1(id).user.userId).toStrictEqual(id);
    });

    test('test email is updated', () => {
      const result = userDetailsUpdateV1(id, emailUpdate, user.nameFirst, user.nameLast);
      expect(result).toStrictEqual({});
      expect(userDetailsV1(id).user.email).toStrictEqual(emailUpdate);
    });

    test('test first name is updated', () => {
      const result = userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, user.nameLast);
      expect(result).toStrictEqual({});
      expect(userDetailsV1(id).user.name).toStrictEqual(`${nameFirstUpdate} ${user.nameLast}`);
    });

    test('test last name is updated', () => {
      const result = userDetailsUpdateV1(id, user.email, user.nameFirst, nameLastUpdate);
      expect(result).toStrictEqual({});
      expect(userDetailsV1(id).user.name).toStrictEqual(`${user.nameFirst} ${nameLastUpdate}`);
    });
  });

  test('returns error when authUserId is not a valid user.', () => {
    expect(userDetailsUpdateV1(id + 1, emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(ERROR);
  });

  describe('returns error with an invalid email', () => {
    test.each(invalidEmails)("test invalid email '$#': '$email'", ({ email }) => {
      expect(userDetailsUpdateV1(id, email, nameFirstUpdate, nameLastUpdate)).toStrictEqual(ERROR);
    });

    test('test email is currently used by another user', () => {
      authRegisterV1('janesmith@gmail.com', 'password2', 'Jane', 'Smith');
      expect(userDetailsUpdateV1(id, 'janesmith@gmail.com', nameFirstUpdate, nameLastUpdate)).toStrictEqual(ERROR);
    });
  });

  describe('returns error with an invalid first name', () => {
    test('test first name contains invalid characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, 'Jane@.#7123', nameLastUpdate)).toStrictEqual(ERROR);
    });

    test('test first name is less than 2 characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, 'J', nameLastUpdate)).toStrictEqual(ERROR);
    });

    test('test first name is empty', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, '', nameLastUpdate)).toStrictEqual(ERROR);
    });

    test('test first name is more than 20 characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, 'JaneJaneJaneJaneJaneJ', nameLastUpdate)).toStrictEqual(ERROR);
    });
  });

  describe('returns error with an invalid last name', () => {
    test('test last name contains invalid characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, 'Doe12*&^')).toStrictEqual(ERROR);
    });

    test('test last name is less than 2 characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, 'D')).toStrictEqual(ERROR);
    });

    test('test last name is empty', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, '')).toStrictEqual(ERROR);
    });

    test('test last name is more than 20 characters', () => {
      expect(userDetailsUpdateV1(id, emailUpdate, nameFirstUpdate, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(ERROR);
    });
  });
});

describe('Testing PUT /v1/admin/user/password', () => {
  let result;
  beforeEach(() => {
    result = authRegisterV1(user.email, user.password, user.nameFirst, user.nameLast);
  });

  const newpassword = 'hey_mee3';

  test('returns an empty object on success', () => {
    expect(userPasswordUpdateV1(result.authUserId, user.password, newpassword)).toStrictEqual({});
  });

  test('password is updated on success', () => {
    userPasswordUpdateV1(result.authUserId, user.password, newpassword);
    expect(authLoginV1(user.email, newpassword)).toStrictEqual({ authUserId: result.authUserId });
  });

  test('returns error when authUserId is not a valid user', () => {
    expect(userPasswordUpdateV1(result.authUserId + 1, user.password, newpassword)).toStrictEqual(ERROR);
  });

  test('returns error when old password is not correct', () => {
    expect(userPasswordUpdateV1(result.authUserId, 'hashed_password3', newpassword)).toStrictEqual(ERROR);
  });

  test('returns error when old password and new password match exactly', () => {
    expect(userPasswordUpdateV1(result.authUserId, user.password, user.password)).toStrictEqual(ERROR);
  });

  describe('returns error with an invalid new password', () => {
    test('test new password is less than 8 characters', () => {
      expect(userPasswordUpdateV1(result.authUserId, user.password, 'abc4567')).toStrictEqual(ERROR);
    });

    test('test new password is empty', () => {
      expect(userPasswordUpdateV1(result.authUserId, user.password, '')).toStrictEqual(ERROR);
    });

    test.each(invalidPasswords)('test new password does not contain at least one number and one letter', ({ password }) => {
      expect(userPasswordUpdateV1(result.authUserId, user.password, password)).toStrictEqual(ERROR);
    });
  });
});
*/
