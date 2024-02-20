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
function adminUserDetails(authUserId) {
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