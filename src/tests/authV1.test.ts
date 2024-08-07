import {
  clearV1,
  authRegisterV1,
  authLoginV1,
  userDetailsV1,
  userDetailsUpdateV1,
  userPasswordUpdateV1,
  authLogoutV1,
} from '../httpHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  TOKEN_SUCCESS,
  USER1,
  USER2,
  USER3,
  INVALID_EMAILS,
  INVALID_PASSWORDS
} from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing POST /v1/admin/auth/register', () => {
  test('Correct status code and return value on success', () => {
    expect(authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast)).toStrictEqual(TOKEN_SUCCESS);
  });

  test('Registers and logins a user with the correct details', () => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    const token = user.token;
    const ret = userDetailsV1(token).jsonBody;
    expect(ret).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: `${USER1.nameFirst} ${USER1.nameLast}`,
        email: USER1.email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Token is unique for each user', () => {
    const result1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    const result2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
    const result3 = authRegisterV1(USER3.email, USER3.password, USER3.nameFirst, USER3.nameLast).jsonBody;
    expect(result1.token).not.toStrictEqual(result2.token);
    expect(result2.token).not.toStrictEqual(result3.token);
    expect(result3.token).not.toStrictEqual(result1.token);
  });

  describe('Bad request error with an invalid email', () => {
    test.each(INVALID_EMAILS)("Invalid email '$#': '$email'", ({ email }) => {
      expect(authRegisterV1(email, USER1.password, USER1.nameFirst, USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Already used email', () => {
      authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
      const result = authRegisterV1(USER1.email, USER2.nameFirst, USER2.nameLast, USER2.password);
      expect(result).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error with an invalid first name', () => {
    test('First name contains invalid characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, 'Jane@.#7123', USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is less than 2 characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, 'J', USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is empty', () => {
      expect(authRegisterV1(USER1.email, USER1.password, '', USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is more than 20 characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, 'JaneJaneJaneJaneJaneJ', USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error with an invalid last name', () => {
    test('Last name contains invalid characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, 'Doe12*&^')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Last name is less than 2 characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, 'D')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Last name is empty', () => {
      expect(authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, '')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Last name is more than 20 characters', () => {
      expect(authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error with an invalid password', () => {
    test('Password is less than 8 characters', () => {
      expect(authRegisterV1(USER1.email, 'abc4567', USER1.nameFirst, USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Password is empty', () => {
      expect(authRegisterV1(USER1.email, '', USER1.nameFirst, USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(INVALID_PASSWORDS)('Password does not contain at least one number and one letter', ({ password }) => {
      expect(authRegisterV1(USER1.email, password, USER1.nameFirst, USER1.nameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/auth/login', () => {
  let token: string;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token;
  });

  test('Correct status code and return value', () => {
    expect(authLoginV1(USER1.email, USER1.password)).toStrictEqual(TOKEN_SUCCESS);
  });

  describe('Bad request errors', () => {
    test.each(INVALID_EMAILS)("Bad request error when email is incorrect '$#': '$email'", ({ email }) => {
      expect(authLoginV1(email, USER1.password)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(INVALID_PASSWORDS)("Bad request error when password is incorrrect '$#': '$password'", ({ password }) => {
      expect(authLoginV1(USER1.email, password)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  test('Successfully logs in a registered user', () => {
    const token = authLoginV1(USER1.email, USER1.password).jsonBody.token;
    expect(userDetailsV1(token).jsonBody).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: `${USER1.nameFirst} ${USER1.nameLast}`,
        email: USER1.email,
        numSuccessfulLogins: 2, // 1 from registration, 1 from login
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Successfully logs in a registered user after logging out', () => {
    const token1 = authLoginV1(USER1.email, USER1.password).jsonBody.token;
    authLogoutV1(token1);
    const token2 = authLoginV1(USER1.email, USER1.password).jsonBody.token;
    expect(userDetailsV1(token2).jsonBody).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: `${USER1.nameFirst} ${USER1.nameLast}`,
        email: USER1.email,
        numSuccessfulLogins: 3, // 1 from registration, 1 from first login, 1 from second login
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  test('Creates a new session for each login', () => {
    const result1 = authLoginV1(USER1.email, USER1.password).jsonBody;
    const result2 = authLoginV1(USER1.email, USER1.password).jsonBody;
    const result3 = authLoginV1(USER1.email, USER1.password).jsonBody;

    // token is different from the one used to register
    expect(result1.token).not.toStrictEqual(token);
    expect(result2.token).not.toStrictEqual(token);
    expect(result3.token).not.toStrictEqual(token);

    // token is different for each login
    expect(result1.token).not.toStrictEqual(result2.token);
    expect(result2.token).not.toStrictEqual(result3.token);
    expect(result3.token).not.toStrictEqual(result1.token);
  });
});

describe('Testing GET /v1/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token;
  });

  test('Correct status code and return value on success', () => {
    const result = userDetailsV1(token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({
      user: {
        userId: expect.any(Number),
        name: `${USER1.nameFirst} ${USER1.nameLast}`,
        email: USER1.email,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
      }
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(userDetailsV1('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userDetailsV1(token + 10)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(userDetailsV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Successfully retrieves user details', () => {
    test('Name is correct', () => {
      expect(userDetailsV1(token).jsonBody.user.name).toStrictEqual(`${USER1.nameFirst} ${USER1.nameLast}`);
    });

    test('Email is correct', () => {
      expect(userDetailsV1(token).jsonBody.user.email).toStrictEqual(USER1.email);
    });

    test('numSuccessfulLogins is 1 on registration', () => {
      expect(userDetailsV1(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(1);
    });

    test('numSuccessfulLogins is 2 on registration and login', () => {
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV1(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(2);
    });

    test('numFailedPasswordsSinceLastLogin is 0 on registration', () => {
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('numFailedPasswordsSinceLastLogin is 1 on registration and failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });
  });

  describe('numSuccessfulLogins is incremented on each successful login', () => {
    test('1 successful login', () => {
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV1(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(2);
    });

    test('2 successful logins', () => {
      authLoginV1(USER1.email, USER1.password);
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV1(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(3);
    });
  });

  describe('numFailedPasswordsSinceLastLogin is incremented on each failed login', () => {
    test('1 failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('2 failed logins', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });
  });

  describe('numFailedPasswordsSinceLastLogin is reset on every successful login', () => {
    test('1 failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('2 failed logins', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV1(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});

describe('Testing PUT /v1/admin/user/details', () => {
  const emailUpdate = 'janedoe@gmail.com';
  const nameFirstUpdate = 'Jane';
  const nameLastUpdate = 'Doe';

  let token: string;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
  });

  test('Correct status code and return value on success', () => {
    const result = userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, nameLastUpdate);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  describe('User details are updated on success', () => {
    test('Email is updated', () => {
      userDetailsUpdateV1(token, emailUpdate, USER1.nameFirst, USER1.nameLast);
      const result = userDetailsV1(token).jsonBody;
      expect(result.user.email).toStrictEqual(emailUpdate);
    });

    test('First name is updated', () => {
      userDetailsUpdateV1(token, USER1.email, nameFirstUpdate, USER1.nameLast);
      const result = userDetailsV1(token).jsonBody;
      expect(result.user.name).toStrictEqual(`${nameFirstUpdate} ${USER1.nameLast}`);
    });

    test('Last name is updated', () => {
      userDetailsUpdateV1(token, USER1.email, USER1.nameFirst, nameLastUpdate);
      const result = userDetailsV1(token).jsonBody;
      expect(result.user.name).toStrictEqual(`${USER1.nameFirst} ${nameLastUpdate}`);
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(userDetailsUpdateV1('', emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userDetailsUpdateV1(token + 'random', emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors with invalid emails', () => {
    test.each(INVALID_EMAILS)("Invalid email '$#': '$email'", ({ email }) => {
      expect(userDetailsUpdateV1(token, email, nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Email is currently used by another user', () => {
      authRegisterV1('janesmith@gmail.com', 'password2', 'Jane', 'Smith');
      expect(userDetailsUpdateV1(token, 'janesmith@gmail.com', nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request errors with invalid first names', () => {
    test('First name contains invalid characters', () => {
      expect(userDetailsUpdateV1(token, emailUpdate, 'Jane@.#7123', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is less than 2 characters', () => {
      expect(userDetailsUpdateV1(token, emailUpdate, 'J', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is empty', () => {
      expect(userDetailsUpdateV1(token, emailUpdate, '', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is more than 20 characters', () => {
      expect(userDetailsUpdateV1(token, emailUpdate, 'JaneJaneJaneJaneJaneJ', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    describe('Bad request errors with invalid last names', () => {
      test('Last name contains invalid characters', () => {
        expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, 'Doe12*&^')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is less than 2 characters', () => {
        expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, 'D')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is empty', () => {
        expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, '')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is more than 20 characters', () => {
        expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(BAD_REQUEST_ERROR);
      });
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidEmail = 'invalid_email';
    const invalidNameFirst = 'invalid_name_first!!';
    const invalidNameLast = 'invalid_name_last!!';

    test('Unauthorised status code 401 first', () => {
      expect(userDetailsUpdateV1(invalidToken, invalidEmail, invalidNameFirst, invalidNameLast)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 400 last', () => {
      expect(userDetailsUpdateV1(token, invalidEmail, nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userDetailsUpdateV1(token, emailUpdate, invalidNameFirst, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userDetailsUpdateV1(token, emailUpdate, nameFirstUpdate, invalidNameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing PUT /v1/admin/user/password', () => {
  let token: string;
  beforeEach(() => {
    const result = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = result.token;
  });

  const newpassword = 'hey_mee3';

  test('Correct status code and return value on success', () => {
    const result = userPasswordUpdateV1(token, USER1.password, newpassword);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  test('Password is updated on success', () => {
    userPasswordUpdateV1(token, USER1.password, newpassword);
    expect(authLoginV1(USER1.email, newpassword).statusCode).toStrictEqual(200);
    expect(authLoginV1(USER1.email, USER1.password).statusCode).toStrictEqual(400);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(userPasswordUpdateV1('', USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userPasswordUpdateV1(token + 'random', USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(userPasswordUpdateV1(token, USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Old password is empty', () => {
      expect(userPasswordUpdateV1(token, '', newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('New password is empty', () => {
      expect(userPasswordUpdateV1(token, USER1.password, '')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Old password is not correct', () => {
      expect(userPasswordUpdateV1(token, 'hashed_password3', newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Old password and new password match exactly', () => {
      expect(userPasswordUpdateV1(token, USER1.password, USER1.password)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('New password is less than 8 characters', () => {
      expect(userPasswordUpdateV1(token, USER1.password, 'abc4567')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(INVALID_PASSWORDS)('New password does not contain at least one number and one letter', ({ password }) => {
      expect(userPasswordUpdateV1(token, USER1.password, password)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidOldPassword = 'invalid_old_password';
    const invalidNewPassword = 'invalid_new_password';

    test('Unauthorised status code 401 first', () => {
      expect(userPasswordUpdateV1(invalidToken, USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 400 last', () => {
      expect(userPasswordUpdateV1(token, invalidOldPassword, newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userPasswordUpdateV1(token, USER1.password, invalidNewPassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/auth/logout', () => {
  let token: string;
  beforeEach(() => {
    const result = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = result.token;
  });

  test('Correct status code and return value on success', () => {
    const result = authLogoutV1(token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(authLogoutV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(authLogoutV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(authLogoutV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  test('Successfully logs out a user session after registration', () => {
    authLogoutV1(token);
    expect(userDetailsV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Successfully logs out a user session after login', () => {
    const token1 = authLoginV1(USER1.email, USER1.password).jsonBody.token;
    authLogoutV1(token1);
    expect(userDetailsV1(token1)).toStrictEqual(UNAUTHORISED_ERROR);
  });
});
