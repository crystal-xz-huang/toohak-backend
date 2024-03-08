import { getData, setData } from './dataStore.js';
import {
  createError,
  findUserbyEmail,
  findUserbyId,
  isValidName,
  isValidAuthUserId,
  isValidPassword,
  isValidEmail,
  getUserIndex,
} from './helper.js';

/**
  * Register a user with an email, password, and first and last name.
  * Returns the authUserId of the user.
  * 
  * @param {string} email - the email of the user
  * @param {string} password - the password of the user
  * @param {string} nameFirst - the first name of the user
  * @param {string} nameLast - the last name of the user
  * 
  * @returns {{authUserId: number}} - object containing the authUserId of the user
*/
export function adminAuthRegister(email, password, nameFirst, nameLast) {
  const dataStore = getData();

  let emailError = isValidEmail(email);
  if (emailError) {
    return emailError;
  } 
  
  if (findUserbyEmail(email, dataStore) !== undefined) {
    return createError('Email is currently used by another user');
  }

  let passwordError = isValidPassword(password, 'Password');
  if (passwordError) {
    return passwordError;
  }
  
  let nameFirstError = isValidName(nameFirst, 'First');
  if (nameFirstError) {
    return nameFirstError;
  }

  let nameLastError = isValidName(nameLast, 'Last');
  if (nameLastError) {
    return nameLastError;
  }

  dataStore.userId_counter = dataStore.userId_counter + 1;
  const user = {
    authUserId: dataStore.userId_counter,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 1,
    numFailedPasswordsSinceLastLogin: 0,
  };
  
  dataStore.users.push(user);
  setData(dataStore);
  return { authUserId: user.authUserId }; 
}


/** 
  * Given a registered user's email and password, returns their authUserId value
  * 
  * @param {string} email - the email of a registered user
  * @param {string} password - the password of a registered user
  * 
  * @returns {{authUserId: number}} - object containing the authUserId of the user 
*/
export function adminAuthLogin(email, password) {
  const dataStore = getData();
  const user = findUserbyEmail(email, dataStore);
  if (user === undefined) {
    return createError('Email does not exist');
  }  

  let ret;
  if (user.password !== password) {
    user.numFailedPasswordsSinceLastLogin = user.numFailedPasswordsSinceLastLogin + 1;
    ret = createError('Password is incorrect');
  } else {
    user.numFailedPasswordsSinceLastLogin = 0;
    user.numSuccessfulLogins = user.numSuccessfulLogins + 1;
    ret = { authUserId: user.authUserId };
  }

  dataStore.users[getUserIndex(user.authUserId, dataStore)] = user;
  setData(dataStore);
  return ret;
}

/**
  * Given an admin user's authUserId, return the user's details.
  * 
  * @param {number} authUserId - a unique admin user identifier
  * 
  * @returns {object} user - an object containing the user's details
  * @property {number} userId - the unique identifier of the user
  * @property {string} name - the first and last name of the user
  * @property {string} email - the email of the user
  * @property {number} numSuccessfulLogins - the number of successful logins for the user
  * @property {number} numFailedPasswordsSinceLastLogin - the number of failed password attempts since the last successful login
*/
export function adminUserDetails(authUserId) {
  const dataStore = getData();
  let foundUser = findUserbyId(authUserId, dataStore);

  let authUserIdError = isValidAuthUserId(authUserId, dataStore);
  if (authUserIdError) {
    return authUserIdError;
  }

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
  * Given an admin user's authUserId and a set of properties, 
  * update the properties of this logged in admin user.
  * 
  * @param {number} authUserId - the id of an admin user
  * @param {string} email - the email of an admin user
  * @param {string} nameFirst - the first name of an admin user
  * @param {string} nameLast - the last name of an admin user
  * 
  * @returns { } - returns nothing
*/
export function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
  const dataStore = getData();
  let foundUser = findUserbyId(authUserId, dataStore);

  let authUserIdError = isValidAuthUserId(authUserId, dataStore);
  if (authUserIdError) {
    return authUserIdError;
  }

  let emailError = isValidEmail(email);
  if (emailError) {
    return emailError;
  }

  let foundUserbyEmail = findUserbyEmail(email, dataStore);
  if (foundUserbyEmail !== undefined && foundUserbyEmail.authUserId !== authUserId) {
    return createError('Email is currently used by another user');
  }
  
  let nameFirstError = isValidName(nameFirst, 'First');
  if (nameFirstError) {
    return nameFirstError;
  }

  let nameLastError = isValidName(nameLast, 'Last');
  if (nameLastError) {
    return nameLastError;
  }

  foundUser.email = email;
  foundUser.nameFirst = nameFirst;
  foundUser.nameLast = nameLast;
  dataStore.users[getUserIndex(authUserId, dataStore)] = foundUser;
  setData(dataStore);
  return {};
}

/**
  * Given details relating to a password change, update the 
  * password of a logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {string} oldPassword - the old password of registered user
  * @param {string} newPassword - the new password of registered user
  * 
  * @returns { } - returns nothing
*/
export function adminUserPasswordUpdate( authUserId, oldPassword, newPassword ) {
  const dataStore = getData();
  let foundUser = findUserbyId(authUserId, dataStore);

  let authUserIdError = isValidAuthUserId(authUserId, dataStore);
  if (authUserIdError) {
    return authUserIdError;
  }
  
  if(foundUser.password !== oldPassword) {
    return createError('Old password is incorrect');
  };

  if (foundUser.password === newPassword) {
    return createError('Old password and new password are the same');
  };

  let passwordError = isValidPassword(newPassword, 'New password');
  if (passwordError) {
    return passwordError;
  };

  foundUser.password = newPassword;
  dataStore.users[getUserIndex(authUserId, dataStore)] = foundUser;
  setData(dataStore);
  return {};
}