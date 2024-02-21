/**
* Given a registered user's email and password, returns their authUserId value
* 
* @param {string} email - the email of a registered user
* @param {string} password - the password of a registered user
* 
* @returns {{authUserId: number}} - object containing the authUserId of the user 
*/
function adminAuthLogin(email, password) {
  // TODO: Implement this function 
  return {
      authUserId: 1,
  };
}


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
function adminAuthRegister(email, password, nameFirst, nameLast) {
  // TODO: Implement this function
  return {
      authUserId: 1,
  };    
}
