import { EmptyObject, ErrorMessage, AdminQuizCreateReturn, AdminQuizListReturn, AdminQuizInfoReturn, AdminQuizTrashViewReturn, AdminQuizQuestionCreateReturn, QuestionBodyInput, AdminQuizQuestionDuplicateReturn } from './dataTypes';
import {
  generateRandomColour,
  getCurrentTime,
  getQuizIndex,
  findUserbyToken,
  findQuizbyId,
  findQuestionIndex,
  findUserbyEmail,
  isValidToken,
  isValidQuizName,
  isValidQuizDescription,
  isQuizNameUsed,
  isValidQuizIdForUser,
  isValidQuestionIdForQuiz,
  isValidQuestion,
} from './functionHelpers';
import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param { string } token - the token that corresponds to a user session
  * @returns { QuizList | ErrorMessage } - an object containing an array of quizzes
*/
export function adminQuizList(token: string): AdminQuizListReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  // find all quizzes that are owned by the currently logged in user
  const authUserId = findUserbyToken(token, data).authUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId)
    .filter(quiz => quiz.valid)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param { string } token - the id of registered user
  * @param { string } name - the name of the quiz
  * @param { string } description - basic details about the quiz
  * @returns { QuizId | ErrorMessage } - object containing quizId of the user
*/
export function adminQuizCreate(token: string, name: string, description: string): AdminQuizCreateReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const inputError = isValidQuizName(name) ??
                     isQuizNameUsed(name, authUserId, data) ??
                     isValidQuizDescription(description);
  if (inputError) {
    return {
      statusCode: 400,
      error: inputError.error
    };
  }

  data.quizId_counter = data.quizId_counter + 1;
  data.quizzes.push({
    quizId: data.quizId_counter,
    name: name,
    authUserId: authUserId,
    description: description,
    timeCreated: getCurrentTime(),
    timeLastEdited: getCurrentTime(),
    numQuestions: 0,
    questions: [],
    duration: 0,
    valid: true
  });

  setData(data);
  return { quizId: data.quizId_counter };
}

/**
  * Given a particular quiz, permanently remove the quiz.
  *
  * @param { number } quizId - the id of the quiz
  * @param { string } token - the token that corresponds to a user session
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizRemove(token: string, quizId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = findQuizbyId(quizId, data);
  if (quiz) {
    quiz.valid = false;
    quiz.timeLastEdited = getCurrentTime();
  }
  setData(data);
  return {};
}

/**
  * Get all of the relevant information about the current quiz.
  *
  * @param { string } token - the id of registered user
  * @param { number } quizId - the id of the quiz
  * @returns  { QuizInfo | ErrorMessage } - object containing the quiz details
*/
export function adminQuizInfo(token: string, quizId: number): AdminQuizInfoReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = findQuizbyId(quizId, data);
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
  };
}

/**
  * Update name of relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } name - the name of the quiz
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizNameUpdate(token: string, quizId: number, name: string): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quizNameError = isValidQuizName(name) ?? isQuizNameUsed(name, authUserId, data);
  if (quizNameError) {
    return {
      statusCode: 400,
      error: quizNameError.error
    };
  }

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].name = name;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } description - the description of quiz
  *
  * @returns { EmptyObject | ErrorMessage } - returns an empty object if successful
*/
export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const descriptionError = isValidQuizDescription(description);
  if (descriptionError) {
    return {
      statusCode: 400,
      error: descriptionError.error
    };
  }

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].description = description;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * View the quizzes that are currently in the trash for the logged in user
 *
 * @param { string } token - the token that corresponds to a user session
 * @returns { AdminQuizTrashViewReturn | ErrorMessage } - an object containing an array of quizzes
 */
export function adminQuizTrashView(token: string): AdminQuizTrashViewReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = data.sessions.find(session => session.token === token).adminUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId && !quiz.valid)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

/**
 * Restore a quiz from trash and update the timeLastEdited
 * @param {string} token
 * @param {number} quizId
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizRestore(token: string, quizId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = findQuizbyId(quizId, data);
  if (quiz.valid) {
    return {
      statusCode: 400,
      error: 'Quiz ID refers to a quiz that is not currently invalid or in the trash'
    };
  }

  const isNameUsed = data.quizzes.some(q => q.name === quiz.name && q.valid === true && q.quizId !== quizId);
  if (isNameUsed) {
    return {
      statusCode: 400,
      error: 'Quiz name of the restored quiz is already used by another active quiz'
    };
  }

  quiz.valid = true;
  quiz.timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * Permanently delete specific quizzes currently sitting in the trash
 *
 * @param {string} token
 * @param {number[]} quizIds
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizTrashEmpty(token: string, quizIds: number[]): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  for (const quizId of quizIds) {
    const userError = isValidQuizIdForUser(authUserId, quizId, data);
    if (userError) {
      return {
        statusCode: 403,
        error: `User does not own the quiz with ID: ${quizId}`
      };
    }
    const quiz = findQuizbyId(quizId, data);
    if (quiz.valid) {
      return {
        statusCode: 400,
        error: 'One or more of the Quiz IDs is not currently in the trash'
      };
    }
  }

  for (const quizId of quizIds) {
    const quizIndex = getQuizIndex(quizId, data);
    data.quizzes.splice(quizIndex, 1);
  }
  setData(data);
  return {};
}

/**
 * Transfer ownership of a quiz to another user
 *
 * @param {string} token
 * @param {number} quizId
 * @param {string} userEmail
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizTransfer(token: string, quizId: number, userEmail: string): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const user = findUserbyEmail(userEmail, data);
  if (!user) {
    return {
      statusCode: 400,
      error: 'User email is not the real user'
    };
  }

  const name = findQuizbyId(quizId, data).name;
  const userId = user.authUserId;
  const QuizNameError = isQuizNameUsed(name, userId, data);
  if (QuizNameError) {
    return {
      statusCode: 400,
      error: 'Quiz ID refers to a quiz that has a name that is already used by the target user'
    };
  }

  const EmailId = user.authUserId;
  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].authUserId = EmailId;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * Create a new question for the quiz with the given quizId
 *
 * @param {string} token
 * @param {number} quizId
 * @param {QuestionBodyInput} questionBody
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizQuestionCreate(token: string, quizId: number, questionBody: QuestionBodyInput): AdminQuizQuestionCreateReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const questionError = isValidQuestion(quiz, questionBody);
  if (questionError) {
    return {
      statusCode: 400,
      error: questionError.error
    };
  }

  quiz.numQuestions = quiz.numQuestions + 1;
  quiz.timeLastEdited = getCurrentTime();
  quiz.duration = quiz.duration + questionBody.duration;
  quiz.questions.push({
    questionId: quiz.numQuestions,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers.map((answer, index) => ({
      answerId: index,
      answer: answer.answer,
      colour: generateRandomColour(),
      correct: answer.correct
    }))
  });

  setData(data);
  return { questionId: quiz.numQuestions };
}

/**
 * Update the quiz question, given the quizId and questionId
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @param {QuestionBodyInput} questionBody
 */
export function adminQuizQuestionUpdate(token: string, quizId: number, questionId: number, questionBody: QuestionBodyInput): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    return {
      statusCode: 400,
      error: questionIdError.error
    };
  }

  const questionError = isValidQuestion(quiz, questionBody);
  if (questionError) {
    return {
      statusCode: 400,
      error: questionError.error
    };
  }

  quiz.timeLastEdited = quiz.timeCreated;
  quiz.duration = quiz.duration - question.duration + questionBody.duration;
  question.question = questionBody.question;
  question.duration = questionBody.duration;
  question.points = questionBody.points;
  question.answers = questionBody.answers.map((answer, index) => ({
    answerId: index,
    answer: answer.answer,
    colour: generateRandomColour(),
    correct: answer.correct
  }));

  setData(data);
  return {};
}

/**
 * Moves a quiz question to a new position in the quiz
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @param {number} newPosition
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizQuestionMove(token: string, quizId: number, questionId: number, newPosition: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId && quiz.valid && quiz.authUserId === authUserId);
  const len = quiz.questions.length;

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    return {
      statusCode: 400,
      error: questionIdError.error
    };
  }

  const index = findQuestionIndex(data, quizId, questionId);
  if (newPosition < 0) {
    return {
      statusCode: 400,
      error: 'NewPosition is less than 0'
    };
  } else if (index === newPosition) {
    return {
      statusCode: 400,
      error: 'Question Id is the same as the NewPosition'
    };
  } else if (newPosition > len - 1) {
    return {
      statusCode: 400,
      error: 'NewPosition is greater than n-1 where n is the number of questions'
    };
  }

  const question = quiz.questions.find(question => question.questionId === questionId);
  quiz.questions.splice(index, 1);
  quiz.questions.splice(newPosition, 0, question);
  quiz.timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * Duplicate a quiz question, given the quizId and questionId
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @param {QuestionBodyInput} questionBody
 * @returns {AdminQuizQuestionDuplicateReturn | ErrorMessage} - returns an object containing the newQuestionId of the duplicated question
 */
export function adminQuizQuestionDuplicate(token: string, quizId: number, questionId: number): AdminQuizQuestionDuplicateReturn | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    return {
      statusCode: 400,
      error: questionIdError.error
    };
  }

  // duplicate the question to immediately after where the source question is
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  const newQuestion = {
    questionId: quiz.numQuestions + 1,
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers.map(answer => ({
      answerId: answer.answerId,
      answer: answer.answer,
      colour: generateRandomColour(),
      correct: answer.correct
    }))
  };
  quiz.numQuestions = quiz.numQuestions + 1;
  quiz.timeLastEdited = getCurrentTime();
  quiz.duration = quiz.duration + question.duration;
  quiz.questions.splice(questionIndex + 1, 0, newQuestion);

  setData(data);
  return { newQuestionId: newQuestion.questionId };
}

/**
 * Remove a question from a quiz
 *
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @returns {EmptyObject | ErrorMessage} - returns an empty object if successful
 */
export function adminQuizQuestionRemove(token: string, quizId: number, questionId: number): EmptyObject | ErrorMessage {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    return {
      statusCode: 401,
      error: tokenError.error
    };
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    return {
      statusCode: 403,
      error: userError.error
    };
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    return {
      statusCode: 400,
      error: questionIdError.error
    };
  }

  quiz.numQuestions = quiz.numQuestions - 1;
  quiz.timeLastEdited = getCurrentTime();
  quiz.duration = quiz.duration - question.duration;
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  quiz.questions.splice(questionIndex, 1);

  setData(data);
  return {};
}
