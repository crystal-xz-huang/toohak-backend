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

function adminQuizList ( authUserId, name, description ) {
    return {
      quizId: 2
    }
    
}