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
    }
    
}