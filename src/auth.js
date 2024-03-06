import { getData, setData } from './dataStore.js';
import {
  createError,
  findUserbyEmail,
  findUserbyId,
  isValidName,
  isValidPassword,
  isValidEmail,
  updateUser,
  generateAuthUserId,
} from './other.js';

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
  let emailError = isValidEmail(email, -1);
  if (emailError) {
    return emailError;
  } 

  let passwordError = isValidPassword(password);
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

  let dataStore = getData();
  const user = {
    authUserId: generateAuthUserId(),
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


/** Given a registered user's email and password, returns their authUserId value
  * 
  * @param {string} email - the email of a registered user
  * @param {string} password - the password of a registered user
  * 
  * @returns {{authUserId: number}} - object containing the authUserId of the user 
*/
export function adminAuthLogin(email, password) {
  let foundUser = findUserbyEmail(email);

  if (foundUser === undefined) {
    return createError('Email does not exist');
  } 
    
  if (foundUser.password !== password) {
    foundUser.numFailedPasswordsSinceLastLogin = foundUser.numFailedPasswordsSinceLastLogin + 1;
    updateUser(foundUser);
    return createError('Password is incorrect');
  }

  foundUser.numFailedPasswordsSinceLastLogin = 0;
  foundUser.numSuccessfulLogins = foundUser.numSuccessfulLogins + 1;
  updateUser(foundUser);
  return { authUserId: foundUser.authUserId };
}

/**
  * Given an admin user's authUserId, return the user's details.
  * 
  * @param {number} authUserId - a unique admin user identifier
  * 
  * @returns {object} user - an object containing the user's details
  * @property {number} authUserId - the unique identifier of the user
  * @property {string} name - the first and last name of the user
  * @property {string} email - the email of the user
  * @property {number} numSuccessfulLogins - the number of successful logins for the user
  * @property {number} numFailedPasswordsSinceLastLogin - the number of failed password attempts since the last successful login
*/
export function adminUserDetails(authUserId) {
   let foundUser = findUserbyId(authUserId);
   if (foundUser === undefined) {
    return createError('authUserId is invalid');
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
export function adminUserDetailsUpdate (authUserId, email, nameFirst, nameLast) {
  let foundUser = findUserbyId(authUserId);
  if (foundUser === undefined) {
    return createError('authUserId is invalid');
  }

  let emailError = isValidEmail(email, authUserId);
  if (emailError) {
    return emailError;
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
  updateUser(foundUser);
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
export function adminUserPasswordUpdate ( authUserId, oldPassword, newPassword ) {
  let foundUser = findUserbyId(authUserId);
  if (foundUser === undefined) {
    return createError('authUserId is invalid');
  }; 

  if(foundUser.password !== oldPassword) {
    return createError('Old password is incorrect');
  };

  if (foundUser.password === newPassword) {
    return createError('Old password and new password are the same');
  };

  let passwordError = isValidPassword(newPassword);
  if (passwordError) {
    return passwordError;
  };

  foundUser.password = newPassword;
  updateUser(foundUser);
  return {};
}