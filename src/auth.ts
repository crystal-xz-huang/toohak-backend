import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  EmptyObject,
  AdminAuthRegisterReturn,
  AdminAuthLoginReturn,
  AdminUserDetailsReturn,
} from './functionTypes';
import {
  getHashOf,
  generateToken,
  isValidRegisterEmail,
  isValidLoginEmail,
  isValidUserEmail,
  isValidPassword,
  isValidName,
  isValidToken,
  findUserbyEmail,
  findUserbyToken,
} from './functionHelpers';

/**
  * Register a user with an email, password, and first and last name.
  * Returns a token that can be used to authenticate the user.
  *
  * @param { string } email - the email of the user
  * @param { string } password - the password of the user
  * @param { string } nameFirst - the first name of the user
  * @param { string } nameLast - the last name of the user
  * @returns { AdminAuthRegisterReturn } - the authUserId of the user
  * @throws { HTTPError } - throws an HTTP 400 error if user input is invalid
*/
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AdminAuthRegisterReturn {
  const data = getData();
  const error = isValidRegisterEmail(email, data) ??
                isValidPassword(password, 'Password') ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');
  if (error) {
    throw HTTPError(400, error.error);
  }

  const userId = data.users.length + 1;
  const token = generateToken();

  // Create a new session for the user
  data.userSessions.push({
    authUserId: userId,
    token: token,
    valid: true,
  });

  // Create a new user
  data.users.push({
    authUserId: userId,
    email: email,
    password: getHashOf(password),
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  });

  setData(data);
  return { token: token };
}

/**
  * Takes in information about an admin user to determine if they can log in to manage quizzes
  *
  * @param { string } email - the email of a registered user
  * @param { string } password - the password of a registered user
  * @returns { AdminAuthLoginReturn } - returns a token on success
  * @throws { HTTPError } - throws an HTTP 400 error if the email or password is invalid
*/
export function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn {
  const data = getData();

  const emailError = isValidLoginEmail(email, data);
  if (emailError) {
    throw HTTPError(400, emailError.error);
  }

  const user = findUserbyEmail(email, data);
  if (user.password !== getHashOf(password)) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    throw HTTPError(400, 'Password is incorrect for the given email');
  }

  const userId = user.authUserId;
  const token = generateToken();

  data.userSessions.push({
    authUserId: userId,
    token: token,
    valid: true,
  });

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins++;
  setData(data);

  return { token: token };
}

/**
  * Given a token, returns the details of the admin user who is logged in.
  *
  * @param { string } token - a unique admin user identifier
  * @returns { AdminUserDetailsReturn } - an object containing the user's details on success
  * @throws { HTTPError } - throws an HTTP 401 error if the token is invalid
*/
export function adminUserDetails(token: string): AdminUserDetailsReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const user = findUserbyToken(token, data);
  return {
    user: {
      userId: user.authUserId,
      name: `${user.nameFirst} ${user.nameLast}`,
      email: user.email,
      numSuccessfulLogins: user.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
  * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
  *
  * @param { token } string - a string that represents the token for the user session
  * @param { string } email - the email of an admin user
  * @param { string } nameFirst - the first name of an admin user
  * @param { string } nameLast - the last name of an admin user
  * @returns { EmptyObject } - returns an empty object on success
  * @throws { HTTPError } - throws either a HTTP 401 error or 400 error
*/
export function adminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): EmptyObject {
  const data = getData();
  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const user = findUserbyToken(token, data);
  const authUserId = user.authUserId;
  const error = isValidUserEmail(email, data, authUserId) ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');
  if (error) {
    throw HTTPError(400, error.error);
  }

  user.email = email;
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  setData(data);

  return {};
}

/**
  * Given details relating to a password change, update the
  * password of a logged in user.
  *
  * @param { string } token - the id of registered user
  * @param { string } oldPassword - the old password of registered user
  * @param { string } newPassword - the new password of registered user
  * @returns { EmptyObject } - returns an empty object on success
  * @throws { HTTPError } - throws an HTTP 401 error if the token is invalid or an HTTP 400 error if user input is invalid
*/
export function adminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const foundUser = findUserbyToken(token, data);
  if (foundUser.password !== getHashOf(oldPassword)) {
    throw HTTPError(400, 'Old password is incorrect');
  }

  if (foundUser.password === getHashOf(newPassword)) {
    throw HTTPError(400, 'Old password and new password are the same');
  }

  const passwordError = isValidPassword(newPassword, 'New password');
  if (passwordError) {
    throw HTTPError(400, passwordError.error);
  }

  foundUser.password = getHashOf(newPassword);
  setData(data);

  return {};
}

/**
 * Given a token, logs out an admin user who has an active quiz session
 * Should be called with a token that is returned after either a login or register has been made
 *
 * @param { string } token - the token that corresponds to a user session
 * @returns { EmptyObject } - returns an empty object on success
 * @throws { HTTPError } - throws an HTTP 401 error if the token is invalid
 */
export function adminAuthLogout(token: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const index = data.userSessions.findIndex((session) => session.token === token);
  data.userSessions[index].valid = false;
  setData(data);
  return {};
}
