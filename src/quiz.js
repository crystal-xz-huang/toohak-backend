/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * 
  * @returns {Array<{quizId: number, name: string}>} - array containing the id and name of the quiz
*/
export function adminQuizList ( authUserId ) {
  return {
    quizzes: [
      {
        quizId: 1,
        name: 'My Quiz',
      }
    ]
  };
}

/**
  * Given basic details about a new quiz,
  * create one for the logged in user.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {string} name - the name of registered user
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/
export function adminQuizCreate ( authUserId, name, description ) {
  return {
    quizId: 2
  }
}

/**
  * Given a particular quiz, permanently remove the quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizRemove(authUserId, quizId) {
  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
  * @returns { name: string } - object containing name of quiz
  * @returns { timeCreated: number } - object containing time quiz was created
  * @returns { timeLastEdited: number} - object containing time quiz was last created
  * @returns { description: string } - object containing a description of the quiz
*/
export function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  };
}

/**
  * Update name of relevant quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * @param {string} name - the name of quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizNameUpdate(authUserId, quizId, name) {
    return {};
}

/**
  * Update the description of the relevant quiz.
  * 
  * @param {number} authUserId - the id of registered user
  * @param {number} quizId - the id of the quiz
  * @param {string} description - the description of quiz
  * 
  * @returns { } - returns nothing
*/
export function adminQuizDescriptionUpdate(authUserId, quizId, description) {
  return {};
}