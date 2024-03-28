import { getData, setData } from './dataStore';
import {
  Error,
  EmptyObject,
  AdminAuthRegisterReturn,
  AdminAuthLoginReturn,
  AdminUserDetailsReturn,
} from './dataTypes';

import {
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
  * Returns the authUserId of the user.
  *
  * @param { string } email - the email of the user
  * @param { string } password - the password of the user
  * @param { string } nameFirst - the first name of the user
  * @param { string } nameLast - the last name of the user
  * @returns { AdminAuthRegisterReturn | Error } - the authUserId of the user
*/
export function adminAuthRegister(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): AdminAuthRegisterReturn | Error {
  const data = getData();
  const error = isValidRegisterEmail(email, data) ??
                isValidPassword(password, 'Password') ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');
  if (error) {
    return {
      statusCode: 400,
      error: error.error
    };
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
  * @returns { UserId | Error } - object containing the authUserId of the user
*/
export function adminAuthLogin(email: string, password: string): AdminAuthLoginReturn | Error {
  const data = getData();

  const emailError = isValidLoginEmail(email, data);
  if (emailError) {
    return {
      statusCode: 400,
      error: emailError.error
    };
  }

  const user = findUserbyEmail(email, data);
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin++;
    setData(data);
    return {
      statusCode: 400,
      error: 'Password is incorrect for the given email'
    };
  }

  const sessionId = data.sessionId_counter + 1;
  const userId = user.authUserId;
  const token = generateToken(sessionId);

  data.sessions.push({
    token: token,
    sessionId: data.sessionId_counter,
    adminUserId: userId,
    valid: true,
  });

  user.numFailedPasswordsSinceLastLogin = 0;
  user.numSuccessfulLogins = user.numSuccessfulLogins + 1;
  setData(data);

  return { token: token };
}

/**
  * Given an admin user's authUserId, return the user's details.
  *
  * @param { string } token - a unique admin user identifier
  * @returns { AdminUserDetailsReturn | Error } - an object containing the user's details on success
*/
export function adminUserDetails(token: string): AdminUserDetailsReturn | Error {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
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
  * @returns { EmptyObject | Error } - returns nothing if successful
*/
export function adminUserDetailsUpdate(token: string, email: string, nameFirst: string, nameLast: string): EmptyObject | Error {
  const data = getData();
  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const user = findUserbyToken(token, data);
  const authUserId = user.authUserId;
  const error = isValidUserEmail(email, data, authUserId) ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');
  if (error) {
    return {
      statusCode: 400,
      error: error.error
    };
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
  * @param { string } token - the id of registered user
  * @param { string } oldPassword - the old password of registered user
  * @param { string } newPassword - the new password of registered user
  * @returns { EmptyObject | Error } - returns nothing
*/
export function adminUserPasswordUpdate(token: string, oldPassword: string, newPassword: string): EmptyObject | Error {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const foundUser = findUserbyToken(token, data);
  if (foundUser.password !== oldPassword) {
    return {
      statusCode: 400,
      error: 'Old password is incorrect'
    };
  }

  if (foundUser.password === newPassword) {
    return {
      statusCode: 400,
      error: 'Old password and new password are the same'
    };
  }

  const passwordError = isValidPassword(newPassword, 'New password');
  if (passwordError) {
    return {
      statusCode: 400,
      error: passwordError.error
    };
  }

  const authUserId = foundUser.authUserId;
  const index = data.users.findIndex((user) => user.authUserId === authUserId);
  data.users[index].password = newPassword;
  setData(data);
  return {};
}

/**
 * Given a token, logs out an admin user who has an active quiz session
 * Should be called with a token that is returned after either a login or register has been made
 *
 * @param { string } token - the token that corresponds to a user session
 * @returns { EmptyObject | Error } - returns an empty object if successful
 */
export function adminAuthLogout(token: string): EmptyObject | Error {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const index = data.sessions.findIndex((session) => session.token === token);
  data.sessions[index].valid = false;
  setData(data);
  return {};
}
