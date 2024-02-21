/**
  *Given basic details about a new quiz,
  * create one for the logged in user.
  * 
  * @param {integer} authUserId - the id of registered user
  * @param {string} name - the name of registered user
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/

function adminQuizCreate ( authUserId, name, description ) {
    return {
      quizId: 2
    }
}

/**
  *Given an id of registered user,
  * return list of quizzes owned by user.
  * 
  * @param {integer} authUserId - the id of registered user
  * @returns {quizzes: [ { quizId: number, name: name } ] } - object containing
  * quizzes of the user
*/

function adminQuizList ( authUserId ) {
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
  *Given basic details about a new quiz,
  * create one for the logged in user.
  * 
  * @param {integer} authUserId - the id of registered user
  * @param {string} name - the name of registered user
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/

function adminQuizRemove(authUserId, quizId) {
  return {};
}

/**
  *Given basic details about a new quiz,
  * create one for the logged in user.
  * 
  * @param {integer} authUserId - the id of registered user
  * @param {string} name - the name of registered user
  * @param {string} description - basic details about the quiz
  * 
  * @returns { quizId: number } - object containing quizId of the user
*/

function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  };
}