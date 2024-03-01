import { getData, setData } from './dataStore';
import {
  isValidName,
  isValidPassword,
  isValidEmail,
} from './other';

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
  let emailError = isValidEmail(email);
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
    userId: dataStore.users.length + 1,
    email: email,
    password: password,
    nameFirst: nameFirst,
    nameLast: nameLast,
    numSuccessfulLogins: 0,
    numFailedLogins: 0,
  };

  dataStore.users.push(user);
  setData(dataStore);
  return { authUserId: user.userId }; 
}

/** Given a registered user's email and password, returns their authUserId value
  * 
  * @param {string} email - the email of a registered user
  * @param {string} password - the password of a registered user
  * 
  * @returns {{authUserId: number}} - object containing the authUserId of the user 
*/
export function adminAuthLogin(email, password) {
  // TODO: Implement this function 
  return {
      authUserId: 1,
  };
}


/**
  * Given an admin user's authUserId, return the user's details.
  * 
  * @param {number} authUserId - a unique admin user identifier
  * 
  * @returns {object} user - an object containing the user's details
  * @property {number} userID - the unique identifier of the user
  * @property {string} name - the first and last name of the user
  * @property {string} email - the email of the user
  * @property {number} numSuccessfulLogins - the number of successful logins for the user
  * @property {number} numFailedPasswordsSinceLastLogin - the number of failed password attempts since the last successful login
*/
export function adminUserDetails(authUserId) {
  // TODO: Implement this function
  return { 
      user: {
          userId: 1,
          name: 'Hayden Smith',
          email: 'hayden.smith@unsw.edu.au',
          numSuccessfulLogins: 3,
          numFailedPasswordsSinceLastLogin: 1,
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
  return {};
}