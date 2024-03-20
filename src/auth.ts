import { getData, setData } from './dataStore';
import HTTPError from 'http-errors';
import {
  ErrorMessage,
  EmptyObject,
  AdminAuthRegisterReturn,
  AdminAuthLoginReturn,
  AdminUserDetailsReturn,
} from './dataTypes';

import {
  isValidRegisterEmail,
  isValidLoginEmail,
  isValidUserEmail,
  isValidPassword,
  isValidName,
  isValidAuthUserId,
  isValidToken,
  findUserbyEmail,
  findUserbyId,
  getUserIndex,
  generateToken,
  findUserbyToken,
  findTokenforUser,
} from './functionHelpers';

/**
  * Register a user with an email, password, and first and last name.
  * Returns the authUserId of the user.
  *
  * @param { string } email - the email of the user
  * @param { string } password - the password of the user
  * @param { string } nameFirst - the first name of the user
  * @param { string } nameLast - the last name of the user
  * @returns { AdminAuthRegisterReturn | ErrorMessage } - the authUserId of the user
*/
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AdminAuthRegisterReturn | ErrorMessage {
  const data = getData();
  const error = isValidRegisterEmail(email, data) ??
                isValidPassword(password, 'Password') ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');
  if (error) {
    throw HTTPError(400, error.error);
  }

  data.sessionId_counter = data.sessionId_counter + 1;
  data.userId_counter = data.userId_counter + 1;

  const sessionId = data.sessionId_counter;
  const userId = data.userId_counter;
  const token = generateToken(sessionId);

  // Create a new session for the user
  data.sessions.push({
    token: token,
    sessionId: sessionId,
    adminUserId: userId,
    valid: true,
  });

  // Create a new user
  data.users.push({
    authUserId: userId,
    email: email,
    password: password,
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
  * @returns { UserId | ErrorMessage } - object containing the authUserId of the user
*/
export function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn | ErrorMessage {
  const data = getData();

  const emailError = isValidLoginEmail(email, data);
  if (emailError) {
    throw HTTPError(400, emailError.error);
  }

  const user = findUserbyEmail(email, data);
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin + 1;
    data.users[getUserIndex(user.authUserId, data)] = user;
    setData(data);
    throw HTTPError(400, 'Password is incorrect for the given email');
  }

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins = user.numSuccessfulLogins + 1;
  data.users[getUserIndex(user.authUserId, data)] = user;
  setData(data);

  // Return the token corresponding to the user
  return findTokenforUser(user.authUserId, data);
}

/**
  * Given an admin user's authUserId, return the user's details.
  *
  * @param { string } token - a unique admin user identifier
  * @returns { AdminUserDetailsReturn | ErrorMessage } - an object containing the user's details on success
*/
export function adminUserDetails(token: string): AdminUserDetailsReturn | ErrorMessage {
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
  * @returns { EmptyObject | ErrorMessage } - returns nothing if successful
*/
export function adminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorMessage {
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

  const index = data.users.findIndex((user) => user.authUserId === authUserId);
  data.users[index].email = email;
  data.users[index].nameFirst = nameFirst;
  data.users[index].nameLast = nameLast;
  setData(data);

  return {};
}

/**
  * Given details relating to a password change, update the
  * password of a logged in user.
  *
  * @param { number } authUserId - the id of registered user
  * @param { string } oldPassword - the old password of registered user
  * @param { string } newPassword - the new password of registered user
  * @returns { EmptyObject | ErrorMessage } - returns nothing
*/
export function adminUserPasswordUpdate(authUserId: number, oldPassword: string, newPassword: string): EmptyObject | ErrorMessage {
  const data = getData();

  const authUserIdError = isValidAuthUserId(authUserId, data);
  if (authUserIdError) {
    throw HTTPError(400, authUserIdError.error);
  }

  const foundUser = findUserbyId(authUserId, data);
  if (foundUser.password !== oldPassword) {
    throw HTTPError(400, 'Old password is incorrect');
  }

  if (foundUser.password === newPassword) {
    throw HTTPError(400, 'Old password and new password are the same');
  }

  const passwordError = isValidPassword(newPassword, 'New password');
  if (passwordError) {
    throw HTTPError(400, passwordError.error);
  }

  data.users[getUserIndex(authUserId, data)].password = newPassword;
  setData(data);
  return {};
}
