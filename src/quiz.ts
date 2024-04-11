import HTTPError from 'http-errors';
import { getData, setData } from './dataStore';
import {
  EmptyObject,
  QuestionBodyInput,
  AdminQuizCreateReturn,
  AdminQuizListReturn,
  AdminQuizInfoReturn,
  AdminQuizTrashViewReturn,
  AdminQuizQuestionCreateReturn,
  AdminQuizQuestionDuplicateReturn
} from './functionTypes';
import {
  generateRandomNumber,
  generateRandomColour,
  getCurrentTime,
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
  isValidImgURL,
} from './functionHelpers';

/**
  * Provide a list of all quizzes that are owned by the currently logged in user.
  *
  * @param { string } token - the token that corresponds to a user session
  * @returns { AdminQuizListReturn } - an object containing an array of quizzes
  * @throws { HTTPError } - throws a HTTP 401 error if the token is invalid
*/
export function adminQuizList(token: string): AdminQuizListReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  // find all quizzes that are owned by the currently logged in user
  const authUserId = findUserbyToken(token, data).authUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId && quiz.valid)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

/**
  * Given basic details about a new quiz, create one for the logged in user.
  *
  * @param { string } token - the id of registered user
  * @param { string } name - the name of the quiz
  * @param { string } description - basic details about the quiz
  * @returns { AdminQuizCreateReturn } - object containing quizId of the user
  * @throws { HTTPError } - thtrows either a HTTP 401 or 400 error
*/
export function adminQuizCreate(token: string, name: string, description: string): AdminQuizCreateReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const inputError = isValidQuizName(name) ??
                     isQuizNameUsed(name, authUserId, data) ??
                     isValidQuizDescription(description);
  if (inputError) {
    throw HTTPError(400, inputError.error);
  }

  const quizId = generateRandomNumber();
  data.quizzes.push({
    quizId: quizId,
    name: name,
    authUserId: authUserId,
    description: description,
    timeCreated: getCurrentTime(),
    timeLastEdited: getCurrentTime(),
    numQuestions: 0,
    questions: [],
    duration: 0,
    thumbnailUrl: '',
    valid: true
  });

  setData(data);
  return { quizId: quizId };
}

/**
  * Given a particular quiz, send it to the trash.
  *
  * @param { number } quizId - the id of the quiz
  * @param { string } token - the token that corresponds to a user session
  * @returns { EmptyObject } - returns an empty object if successful
  * @throws { HTTPError } - throws either a HTTP 401 or 403 error
*/
export function adminQuizTrash(token: string, quizId: number): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
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
  * @returns  { AdminQuizInfoReturn } - object containing the quiz details
  * @throws { HTTPError } - throws either a HTTP 401 or 403 error
*/
export function adminQuizInfo(token: string, quizId: number): AdminQuizInfoReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration,
    thumbnailUrl: quiz.thumbnailUrl,
  };
}

/**
  * Update name of relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } name - the name of the quiz
  * @returns { EmptyObject } - returns an empty object if successful
  * @throws { HTTPError } - throws either a HTTP 401, 403 or 400 error
*/
export function adminQuizNameUpdate(token: string, quizId: number, name: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quizNameError = isValidQuizName(name) ?? isQuizNameUsed(name, authUserId, data);
  if (quizNameError) {
    throw HTTPError(400, quizNameError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId && quiz.valid && quiz.authUserId === authUserId);
  quiz.name = name;
  quiz.timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
  * Update the description of the relevant quiz.
  *
  * @param { string } token - the token that corresponds to a user session
  * @param { number } quizId - the id of the quiz
  * @param { string } description - the description of quiz
  * @returns { EmptyObject } - returns an empty object on success
  * @throws { HTTPError } - throws either a HTTP 401, 403 or 400 error
*/
export function adminQuizDescriptionUpdate(token: string, quizId: number, description: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const descriptionError = isValidQuizDescription(description);
  if (descriptionError) {
    throw HTTPError(400, descriptionError.error);
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
 * @returns { AdminQuizTrashViewReturn } - an object containing an array of quizzes
 * @throws { HTTPError } - throws an HTTP 401 error if the token is invalid
 */
export function adminQuizTrashView(token: string): AdminQuizTrashViewReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = data.userSessions.find(session => session.token === token).authUserId;
  const quizDetails = data.quizzes
    .filter(quiz => quiz.authUserId === authUserId && !quiz.valid)
    .map(quiz => ({ quizId: quiz.quizId, name: quiz.name }));

  return { quizzes: quizDetails };
}

/**
 * Restore a quiz from trash and update the timeLastEdited
 * @param { string } token
 * @param { number } quizId
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizRestore(token: string, quizId: number): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  if (quiz.valid) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that is not currently invalid or in the trash');
  }

  const quizNameUsed = isQuizNameUsed(quiz.name, authUserId, data);
  if (quizNameUsed) {
    throw HTTPError(400, 'Quiz name of the restored quiz is already used by another active quiz');
  }

  quiz.valid = true;
  quiz.timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * Permanently delete specific quizzes currently sitting in the trash
 *
 * @param { string } token
 * @param { number[] } quizIds
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizTrashEmpty(token: string, quizIds: number[]): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  for (const quizId of quizIds) {
    const userError = isValidQuizIdForUser(authUserId, quizId, data);
    if (userError) {
      throw HTTPError(403, `User does not own the quiz with ID: ${quizId}`);
    }
    const quiz = findQuizbyId(quizId, data);
    if (!quiz || quiz.valid) {
      throw HTTPError(400, 'One or more of the Quiz IDs is not currently in the trash');
    }
  }

  for (const quizId of quizIds) {
    const quizIndex = data.quizzes.findIndex(quiz => quiz.quizId === quizId);
    data.quizzes.splice(quizIndex, 1);
  }
  setData(data);
  return {};
}

/**
 * Transfer ownership of a quiz to another user
 *
 * @param { string } token - the token that corresponds to a user session
 * @param { number } quizId - the id of the quiz to transfer
 * @param { string } userEmail - the email of the user to transfer the quiz to
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizTransfer(token: string, quizId: number, userEmail: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const ownerId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(ownerId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const targetUser = findUserbyEmail(userEmail, data);
  if (!targetUser) {
    throw HTTPError(400, 'User email is not the real user');
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId && quiz.authUserId === ownerId);
  const targetUserId = targetUser.authUserId;
  const quizNameUsedError = isQuizNameUsed(quiz.name, targetUserId, data);
  if (quizNameUsedError) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has a name that is already used by the target user');
  }

  // check if any session for the quiz is not in END state
  const endSessions = data.quizSessions.filter((s) => s.metadata.quizId === quizId && s.state !== 'END');
  if (endSessions.length > 0) {
    throw HTTPError(400, 'Quiz ID refers to a quiz that has an active session');
  }

  const quizIndex = data.quizzes.findIndex((quiz) => quiz.quizId === quizId);
  data.quizzes[quizIndex].authUserId = targetUserId;
  data.quizzes[quizIndex].timeLastEdited = getCurrentTime();

  setData(data);
  return {};
}

/**
 * Create a new question for the quiz with the given quizId
 *
 * @param { string } token
 * @param { number } quizId
 * @param { QuestionBodyInput } questionBody
 * @returns { AdminQuizQuestionCreateReturn } - returns an object containing the questionId of the new question
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizQuestionCreate(token: string, quizId: number, questionBody: QuestionBodyInput): AdminQuizQuestionCreateReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const questionError = isValidQuestion(quiz, questionBody);
  if (questionError) {
    throw HTTPError(400, questionError.error);
  }

  const thumbnailUrlError = isValidImgURL(questionBody.thumbnailUrl);
  if (thumbnailUrlError) {
    throw HTTPError(400, thumbnailUrlError.error);
  }

  const questionId = generateRandomNumber();
  quiz.numQuestions = quiz.numQuestions + 1;
  quiz.timeLastEdited = getCurrentTime();
  quiz.duration = quiz.duration + questionBody.duration;
  quiz.questions.push({
    questionId: questionId,
    question: questionBody.question,
    duration: questionBody.duration,
    thumbnailUrl: questionBody.thumbnailUrl,
    points: questionBody.points,
    answers: questionBody.answers.map((answer, index) => ({
      answerId: index,
      answer: answer.answer,
      colour: generateRandomColour(),
      correct: answer.correct
    }))
  });

  setData(data);
  return { questionId: questionId };
}

/**
 * Update the quiz question, given the quizId and questionId
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } questionId
 * @param { QuestionBodyInput } questionBody
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizQuestionUpdate(token: string, quizId: number, questionId: number, questionBody: QuestionBodyInput): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    throw HTTPError(400, questionIdError.error);
  }

  const questionError = isValidQuestion(quiz, questionBody);
  if (questionError) {
    throw HTTPError(400, questionError.error);
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
 * @param { string } token
 * @param { number } quizId
 * @param { number } questionId
 * @param { number } newPosition
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizQuestionMove(token: string, quizId: number, questionId: number, newPosition: number): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId && quiz.valid && quiz.authUserId === authUserId);
  const len = quiz.questions.length;

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    throw HTTPError(400, questionIdError.error);
  }

  const index = findQuestionIndex(data, quizId, questionId);
  if (newPosition < 0) {
    throw HTTPError(400, 'NewPosition is less than 0');
  } else if (index === newPosition) {
    throw HTTPError(400, 'Question Id is the same as the NewPosition');
  } else if (newPosition > len - 1) {
    throw HTTPError(400, 'NewPosition is greater than n-1 where n is the number of questions');
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
 * @param { string } token
 * @param { number } quizId
 * @param { number } questionId
 * @param { QuestionBodyInput } questionBody
 * @returns { AdminQuizQuestionDuplicateReturn } - returns an object containing the newQuestionId of the duplicated question
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizQuestionDuplicate(token: string, quizId: number, questionId: number): AdminQuizQuestionDuplicateReturn {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questinIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questinIdError) {
    throw HTTPError(400, questinIdError.error);
  }

  // duplicate the question to immediately after where the source question is
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  const newQuestionId = generateRandomNumber();
  const newQuestion = {
    questionId: newQuestionId,
    question: question.question,
    duration: question.duration,
    thumbnailUrl: question.thumbnailUrl,
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
  return { newQuestionId: newQuestionId };
}

/**
 * Remove a question from a quiz
 *
 * @param { string } token
 * @param { number } quizId
 * @param { number } questionId
 * @returns { EmptyObject } - returns an empty object if successful
 * @throws { HTTPError } - throws an HTTP 401, 403 or 400 error
 */
export function adminQuizQuestionRemove(token: string, quizId: number, questionId: number): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const quiz = data.quizzes.find(quiz => quiz.quizId === quizId);
  const question = quiz.questions.find(question => question.questionId === questionId);

  const questionIdError = isValidQuestionIdForQuiz(quiz, questionId);
  if (questionIdError) {
    throw HTTPError(400, questionIdError.error);
  }

  quiz.numQuestions = quiz.numQuestions - 1;
  quiz.timeLastEdited = getCurrentTime();
  quiz.duration = quiz.duration - question.duration;
  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  quiz.questions.splice(questionIndex, 1);

  setData(data);
  return {};
}

/**
 * Update the thumbnail for the quiz
 * Also updates the timeLastEdited
 *
 * @param { string } token
 * @param { number } quizId
 * @param { string } imgUrl
 * @returns { EmptyObject }
 */
export function adminQuizThumbnailUpdate(token: string, quizId: number, imgUrl: string): EmptyObject {
  const data = getData();

  const tokenError = isValidToken(token, data);
  if (tokenError) {
    throw HTTPError(401, tokenError.error);
  }

  const authUserId = findUserbyToken(token, data).authUserId;
  const userError = isValidQuizIdForUser(authUserId, quizId, data);
  if (userError) {
    throw HTTPError(403, userError.error);
  }

  const imgUrlError = isValidImgURL(imgUrl);
  if (imgUrlError) {
    throw HTTPError(400, imgUrlError.error);
  }

  const quiz = findQuizbyId(quizId, data);
  quiz.thumbnailUrl = imgUrl;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}
