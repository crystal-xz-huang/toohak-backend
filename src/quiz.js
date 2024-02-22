/**
  * Provide a list of all quizzes that are owned by 
  * the currently logged in user.
  * 
  * @param {integer} authUserId - the id of registered user
  * 
  * @returns { {quizId: integer
  *             name: string}} - object containing userId and name of the user
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

function adminQuizRemove(authUserId, quizId) {
  return {};
}

function adminQuizInfo(authUserId, quizId) {
  return {
    quizId: 1,
    name: 'My Quiz',
    timeCreated: 1683125870,
    timeLastEdited: 1683125871,
    description: 'This is my quiz',
  };
}