/**
  * Register a user with an email, password, and names, then returns their authUserId value
  * 
  * @param {string} email - the email of the user
  * @param {string} password - the password of the user
  * @param {string} nameFirst - the first name of the user
  * @param {string} nameLast - the last name of the user
  * 
  * @returns {{authUserId: 1}} - object 
*/
function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    }    
}