import { getData, setData } from './dataStore';
import { UserDetails, ErrorMessage, UserId, EmptyObject } from './types';
import {
  createError,
  findUserbyEmail,
  findUserbyId,
  isValidName,
  isValidAuthUserId,
  isValidPassword,
  isValidEmail,
  getUserIndex,
} from './helper';

/**
  * Register a user with an email, password, and first and last name.
  * Returns the authUserId of the user.
  *
  * @param { string } email - the email of the user
  * @param { string } password - the password of the user
  * @param { string } nameFirst - the first name of the user
  * @param { string } nameLast - the last name of the user
  * @returns { UserId | ErrorMessage } - the authUserId of the user
*/
export function adminAuthRegister(email: string, password: string, nameFirst: string, nameLast: string): UserId | ErrorMessage {
  const data = getData();

  const error = isValidEmail(email, data, true, false) ??
                isValidPassword(password, 'Password') ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');

  if (error) return error;

  data.userId_counter = data.userId_counter + 1;
  data.users.push({
    authUserId: data.userId_counter,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 0,
    numFailedPasswordsSinceLastLogin: 0,
  });

  setData(data);
  return { authUserId: data.userId_counter };

  // let emailError = isValidEmail(email, data, true);
  // if (emailError) {
  //   return emailError;
  // }

  // let passwordError = isValidPassword(password, 'Password');
  // if (passwordError) {
  //   return passwordError;
  // }

  // let nameFirstError = isValidName(nameFirst, 'First');
  // if (nameFirstError) {
  //   return nameFirstError;
  // }

  // let nameLastError = isValidName(nameLast, 'Last');
  // if (nameLastError) {
  //   return nameLastError;
  // }
}

/**
  * Given a registered user's email and password, returns their authUserId value
  *
  * @param { string } email - the email of a registered user
  * @param { string } password - the password of a registered user
  * @returns { UserId | ErrorMessage } - object containing the authUserId of the user
*/
export function adminAuthLogin(email: string, password: string): UserId | ErrorMessage {
  const data = getData();

  const emailError = isValidEmail(email, data, false, true);
  if (emailError) return emailError;

  const user = findUserbyEmail(email, data);
  // if (user === null) {
  //   return createError('Email does not exist');
  // }

  let ret: UserId | ErrorMessage;
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin + 1;
    ret = createError('Password is incorrect');
  } else {
    user.numFailedPasswordsSinceLastLogin = 0;
    user.numSuccessfulLogins = user.numSuccessfulLogins + 1;
    ret = { authUserId: user.authUserId };
  }

  data.users[getUserIndex(user.authUserId, data)] = user;
  setData(data);
  return ret;
}

/**
  * Given an admin user's authUserId, return the user's details.
  *
  * @param { number } authUserId - a unique admin user identifier
  * @returns { UserDetails | ErrorMessage } - an object containing the user's details on success
*/
export function adminUserDetails(authUserId: number): UserDetails | ErrorMessage {
  const data = getData();

  const authUserIdError = isValidAuthUserId(authUserId, data);
  if (authUserIdError) return authUserIdError;

  const foundUser = findUserbyId(authUserId, data);
  return {
    user: {
      userId: foundUser.authUserId,
      name: `${foundUser.nameFirst} ${foundUser.nameLast}`,
      email: foundUser.email,
      numSuccessfulLogins: foundUser.numSuccessfulLogins,
      numFailedPasswordsSinceLastLogin: foundUser.numFailedPasswordsSinceLastLogin,
    }
  };
}

/**
  * Given an admin user's authUserId and a set of properties, update the properties of this logged in admin user.
  *
  * @param { number } authUserId - the id of an admin user
  * @param { string } email - the email of an admin user
  * @param { string } nameFirst - the first name of an admin user
  * @param { string } nameLast - the last name of an admin user
  * @returns { EmptyObject | ErrorMessage } - returns nothing if successful
*/
export function adminUserDetailsUpdate(authUserId: number, email: string, nameFirst: string, nameLast: string): EmptyObject | ErrorMessage {
  const data = getData();
  const error = isValidAuthUserId(authUserId, data) ??
                isValidEmail(email, data, false, false, authUserId) ??
                isValidName(nameFirst, 'First') ??
                isValidName(nameLast, 'Last');

  if (error) return error;

  data.users[getUserIndex(authUserId, data)].email = email;
  data.users[getUserIndex(authUserId, data)].nameFirst = nameFirst;
  data.users[getUserIndex(authUserId, data)].nameLast = nameLast;
  setData(data);
  return {};

  // let foundUser = findUserbyId(authUserId, data);

  // let authUserIdError = isValidAuthUserId(authUserId, data);
  // if (authUserIdError) {
  //   return authUserIdError;
  // }

  // let emailError = isValidEmail(email);
  // if (emailError) {
  //   return emailError;
  // }

  // let foundUserbyEmail = findUserbyEmail(email, data);
  // if (foundUserbyEmail !== undefined && foundUserbyEmail.authUserId !== authUserId) {
  //   return createError('Email is currently used by another user');
  // }

  // let nameFirstError = isValidName(nameFirst, 'First');
  // if (nameFirstError) {
  //   return nameFirstError;
  // }

  // let nameLastError = isValidName(nameLast, 'Last');
  // if (nameLastError) {
  //   return nameLastError;
  // }

  // foundUser.email = email;
  // foundUser.nameFirst = nameFirst;
  // foundUser.nameLast = nameLast;
  // data.users[getUserIndex(authUserId, data)] = foundUser;
  // setData(data);
  // return {};
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
  const foundUser = findUserbyId(authUserId, data);

  const authUserIdError = isValidAuthUserId(authUserId, data);
  if (authUserIdError) {
    return authUserIdError;
  }

  if (foundUser.password !== oldPassword) {
    return createError('Old password is incorrect');
  }

  if (foundUser.password === newPassword) {
    return createError('Old password and new password are the same');
  }

  const passwordError = isValidPassword(newPassword, 'New password');
  if (passwordError) {
    return passwordError;
  }

  data.users[getUserIndex(authUserId, data)].password = newPassword;
  setData(data);
  return {};
}
