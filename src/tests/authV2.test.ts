import {
  clearV1,
  authRegisterV1,
  authLoginV1,
  userDetailsV2,
  userDetailsUpdateV2,
  userPasswordUpdateV2,
  authLogoutV2,
} from '../httpHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  USER1,
  INVALID_EMAILS,
  INVALID_PASSWORDS
} from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
// Remove .skip from describe.skip to run the tests
// Use .only to run only that block of tests
//= =============================================================================

describe('Testing GET /v2/admin/user/details', () => {
  let token: string;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token;
  });

  test('Correct status code and return value on success', () => {
    const result = userDetailsV2(token);
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
      expect(userDetailsV2('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userDetailsV2(token + 10)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(userDetailsV2(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Successfully retrieves user details', () => {
    test('Name is correct', () => {
      expect(userDetailsV2(token).jsonBody.user.name).toStrictEqual(`${USER1.nameFirst} ${USER1.nameLast}`);
    });

    test('Email is correct', () => {
      expect(userDetailsV2(token).jsonBody.user.email).toStrictEqual(USER1.email);
    });

    test('numSuccessfulLogins is 1 on registration', () => {
      expect(userDetailsV2(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(1);
    });

    test('numSuccessfulLogins is 2 on registration and login', () => {
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV2(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(2);
    });

    test('numFailedPasswordsSinceLastLogin is 0 on registration', () => {
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('numFailedPasswordsSinceLastLogin is 1 on registration and failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });
  });

  describe('numSuccessfulLogins is incremented on each successful login', () => {
    test('1 successful login', () => {
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV2(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(2);
    });

    test('2 successful logins', () => {
      authLoginV1(USER1.email, USER1.password);
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV2(token).jsonBody.user.numSuccessfulLogins).toStrictEqual(3);
    });
  });

  describe('numFailedPasswordsSinceLastLogin is incremented on each failed login', () => {
    test('1 failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(1);
    });

    test('2 failed logins', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, 'incorrect_password');
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(2);
    });
  });

  describe('numFailedPasswordsSinceLastLogin is reset on every successful login', () => {
    test('1 failed login', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });

    test('2 failed logins', () => {
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, 'incorrect_password');
      authLoginV1(USER1.email, USER1.password);
      expect(userDetailsV2(token).jsonBody.user.numFailedPasswordsSinceLastLogin).toStrictEqual(0);
    });
  });
});

describe.skip('Testing PUT /v2/admin/user/details', () => {
  const emailUpdate = 'janedoe@gmail.com';
  const nameFirstUpdate = 'Jane';
  const nameLastUpdate = 'Doe';

  let token: string;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
  });

  test('Correct status code and return value on success', () => {
    const result = userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, nameLastUpdate);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  describe('User details are updated on success', () => {
    test('Email is updated', () => {
      userDetailsUpdateV2(token, emailUpdate, USER1.nameFirst, USER1.nameLast);
      const result = userDetailsV2(token).jsonBody;
      expect(result.user.email).toStrictEqual(emailUpdate);
    });

    test('First name is updated', () => {
      userDetailsUpdateV2(token, USER1.email, nameFirstUpdate, USER1.nameLast);
      const result = userDetailsV2(token).jsonBody;
      expect(result.user.name).toStrictEqual(`${nameFirstUpdate} ${USER1.nameLast}`);
    });

    test('Last name is updated', () => {
      userDetailsUpdateV2(token, USER1.email, USER1.nameFirst, nameLastUpdate);
      const result = userDetailsV2(token).jsonBody;
      expect(result.user.name).toStrictEqual(`${USER1.nameFirst} ${nameLastUpdate}`);
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(userDetailsUpdateV2('', emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userDetailsUpdateV2(token + 'random', emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, nameLastUpdate)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors with invalid emails', () => {
    test.each(INVALID_EMAILS)("Invalid email '$#': '$email'", ({ email }) => {
      expect(userDetailsUpdateV2(token, email, nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Email is currently used by another user', () => {
      authRegisterV1('janesmith@gmail.com', 'password2', 'Jane', 'Smith');
      expect(userDetailsUpdateV2(token, 'janesmith@gmail.com', nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request errors with invalid first names', () => {
    test('First name contains invalid characters', () => {
      expect(userDetailsUpdateV2(token, emailUpdate, 'Jane@.#7123', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is less than 2 characters', () => {
      expect(userDetailsUpdateV2(token, emailUpdate, 'J', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is empty', () => {
      expect(userDetailsUpdateV2(token, emailUpdate, '', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('First name is more than 20 characters', () => {
      expect(userDetailsUpdateV2(token, emailUpdate, 'JaneJaneJaneJaneJaneJ', nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    describe('Bad request errors with invalid last names', () => {
      test('Last name contains invalid characters', () => {
        expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, 'Doe12*&^')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is less than 2 characters', () => {
        expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, 'D')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is empty', () => {
        expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, '')).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Last name is more than 20 characters', () => {
        expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(BAD_REQUEST_ERROR);
      });
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidEmail = 'invalid_email';
    const invalidNameFirst = 'invalid_name_first!!';
    const invalidNameLast = 'invalid_name_last!!';

    test('Unauthorised status code 401 first', () => {
      expect(userDetailsUpdateV2(invalidToken, invalidEmail, invalidNameFirst, invalidNameLast)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 400 last', () => {
      expect(userDetailsUpdateV2(token, invalidEmail, nameFirstUpdate, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userDetailsUpdateV2(token, emailUpdate, invalidNameFirst, nameLastUpdate)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userDetailsUpdateV2(token, emailUpdate, nameFirstUpdate, invalidNameLast)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing PUT /v2/admin/user/password', () => {
  let token: string;
  beforeEach(() => {
    const result = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = result.token;
  });

  const newpassword = 'hey_mee3';

  test('Correct status code and return value on success', () => {
    const result = userPasswordUpdateV2(token, USER1.password, newpassword);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  test('Password is updated on success', () => {
    userPasswordUpdateV2(token, USER1.password, newpassword);
    expect(authLoginV1(USER1.email, newpassword).statusCode).toStrictEqual(200);
    expect(authLoginV1(USER1.email, USER1.password).statusCode).toStrictEqual(400);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(userPasswordUpdateV2('', USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(userPasswordUpdateV2(token + 'random', USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(userPasswordUpdateV2(token, USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Old password is empty', () => {
      expect(userPasswordUpdateV2(token, '', newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('New password is empty', () => {
      expect(userPasswordUpdateV2(token, USER1.password, '')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Old password is not correct', () => {
      expect(userPasswordUpdateV2(token, 'hashed_password3', newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Old password and new password match exactly', () => {
      expect(userPasswordUpdateV2(token, USER1.password, USER1.password)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('New password is less than 8 characters', () => {
      expect(userPasswordUpdateV2(token, USER1.password, 'abc4567')).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(INVALID_PASSWORDS)('New password does not contain at least one number and one letter', ({ password }) => {
      expect(userPasswordUpdateV2(token, USER1.password, password)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidOldPassword = 'invalid_old_password';
    const invalidNewPassword = 'invalid_new_password';

    test('Unauthorised status code 401 first', () => {
      expect(userPasswordUpdateV2(invalidToken, USER1.password, newpassword)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 400 last', () => {
      expect(userPasswordUpdateV2(token, invalidOldPassword, newpassword)).toStrictEqual(BAD_REQUEST_ERROR);
      expect(userPasswordUpdateV2(token, USER1.password, invalidNewPassword)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v2/admin/auth/logout', () => {
  let token: string;
  beforeEach(() => {
    const result = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = result.token;
  });

  test('Correct status code and return value on success', () => {
    const result = authLogoutV2(token);
    expect(result.statusCode).toStrictEqual(200);
    expect(result.jsonBody).toStrictEqual({});
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(authLogoutV2(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(authLogoutV2(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(authLogoutV2(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  test('Successfully logs out a user session after registration', () => {
    authLogoutV2(token);
    expect(userDetailsV2(token)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Successfully logs out a user session after login', () => {
    const token1 = authLoginV1(USER1.email, USER1.password).jsonBody.token;
    authLogoutV2(token1);
    expect(userDetailsV2(token1)).toStrictEqual(UNAUTHORISED_ERROR);
  });
});
