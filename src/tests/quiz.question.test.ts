import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizCreateV1,
  quizInfoV1,
  quizQuestionCreateV1,
  quizQuestionUpdateV1,
  quizQuestionRemoveV1,
  quizQuestionMoveV1,
  quizQuestionDuplicateV1,
} from '../testHelpers';

import {
  user1,
  user2,
  quiz1,
  validQuestion1,
  validQuestion2,
  validQuestion3,
  validQuestion4,
  shortQuestionString,
  longQuestionString,
  moreQuestionAnswers,
  lessQuestionAnswers,
  negativeQuestionDuration,
  moreQuestionDurationSum,
  lessQuestionPoints,
  moreQuestionPoints,
  shortQuestionAnswers,
  longQuestionAnswers,
  duplicateQuestionAnswers,
  falseQuestionAnswers,
} from '../testTypes';
import { BAD_REQUEST_ERROR, UNAUTHORISED_ERROR, FORBIDDEN_ERROR } from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  let token: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token as string;
    quizId = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV1(token, quizId, validQuestion1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV1(token, quizId, validQuestion2).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionUpdateV1(token, quizId, questionId1, validQuestion3);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successfully updates a question', () => {
    quizQuestionUpdateV1(token, quizId, questionId1, validQuestion2);
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 2,
      questions: [
        {
          questionId: questionId1,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        }
      ],
      duration: validQuestion2.duration * 2
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully updates 2 questions', () => {
    quizQuestionUpdateV1(token, quizId, questionId1, validQuestion3);
    quizQuestionUpdateV1(token, quizId, questionId2, validQuestion4);
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 2,
      questions: [
        {
          questionId: questionId1,
          question: validQuestion3.question,
          duration: validQuestion3.duration,
          points: validQuestion3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion3.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion3.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion3.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: validQuestion4.question,
          duration: validQuestion4.duration,
          points: validQuestion4.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion4.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion4.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion4.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion4.answers[1].correct
            }
          ]
        }
      ],
      duration: validQuestion3.duration + validQuestion4.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionUpdateV1(token, quizId, questionId1, validQuestion2);
    const response2 = quizInfoV1(token, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionUpdateV1('', quizId, questionId1, validQuestion2)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionUpdateV1(token + 'random', quizId, questionId1, validQuestion2)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizQuestionUpdateV1(token, quizId, questionId1, validQuestion2)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionUpdateV1(token, -1, questionId1, validQuestion2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionUpdateV1(token2, quizId, questionId1, validQuestion2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      const response = quizQuestionUpdateV1(token, quizId, -1, validQuestion2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(shortQuestionString)('Question string is less than 5 characters', (question) => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question string is more than 100 characters', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, longQuestionString);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question has more than 6 answers', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, moreQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(lessQuestionAnswers)('Question has less than 2 answers', (question) => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(negativeQuestionDuration)('Question duration is not a positive number', (question) => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Sum of the question durations in the quiz exceeds 3 minutes after update', () => {
      quizQuestionUpdateV1(token, quizId, questionId1, moreQuestionDurationSum[0]);
      const response = quizQuestionUpdateV1(token, quizId, questionId2, moreQuestionDurationSum[1]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are less than 1', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, lessQuestionPoints);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are more than 10', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, moreQuestionPoints);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(shortQuestionAnswers)('Length of any answer is shorter than 1 character', (question) => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(longQuestionAnswers)('Length of any answer is longer than 30 characters', (question) => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Any answer strings are duplicates of one another within the same question', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, duplicateQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('No correct answers', () => {
      const response = quizQuestionUpdateV1(token, quizId, questionId1, falseQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionUpdateV1(invalidToken, invalidQuizId, invalidQuestionId, validQuestion2);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionUpdateV1(token, invalidQuizId, invalidQuestionId, validQuestion2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionUpdateV1(token, quizId, invalidQuestionId, validQuestion2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing DELETE /v1/admin/quiz/{quizid}/question/{questionid}', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId = quiz.quizId;
    const question = quizQuestionCreateV1(token, quizId, validQuestion1).jsonBody;
    questionId = question.questionId;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionRemoveV1(token, quizId, questionId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful removal of one question', () => {
    quizQuestionRemoveV1(token, quizId, questionId);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(response.questions).toStrictEqual([]);
  });

  test('Successful removal of one question, and creation of a new question with the same body', () => {
    quizQuestionRemoveV1(token, quizId, questionId);
    const response1 = quizInfoV1(token, quizId).jsonBody;
    expect(response1.questions).toStrictEqual([]);
    quizQuestionCreateV1(token, quizId, validQuestion1);
    const response2 = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        }
      ],
      duration: 4,
    };
    expect(response2).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionRemoveV1(token, quizId, questionId);
    const timeLastEdited = quizInfoV1(token, quizId).jsonBody.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Bad request errors', () => {
    test('Valid token but invalid questionId', () => {
      const response = quizQuestionRemoveV1(token, quizId, questionId + 1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    // test('Any session for this quiz is not in END state', () => {
    // });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionRemoveV1('', quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionRemoveV1(token + 'random', quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizQuestionRemoveV1(token, quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionRemoveV1(token, quizId + 1, questionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionRemoveV1(token2, quizId, questionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionRemoveV1(invalidToken, quizId + 1, questionId + 1);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizQuestionRemoveV1(emptyToken, quizId + 1, questionId + 1);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response1 = quizQuestionRemoveV1(notOwnerToken, quizId, questionId + 1);
      expect(response1).toStrictEqual(FORBIDDEN_ERROR);
      const response2 = quizQuestionRemoveV1(token, quizId + 1, questionId + 1);
      expect(response2).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let token: string;
  let quizId: number;
  let quesId1: number;
  let quesId2: number;
  let quesId3: number;
  let newPosition: number;
  beforeEach(() => {
    token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token as string;
    quizId = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId as number;

    const q1 = quizQuestionCreateV1(token, quizId, validQuestion1).jsonBody;
    quesId1 = q1.questionId as number;

    const q2 = quizQuestionCreateV1(token, quizId, validQuestion2).jsonBody;
    quesId2 = q2.questionId as number;

    const q3 = quizQuestionCreateV1(token, quizId, validQuestion3).jsonBody;
    quesId3 = q3.questionId as number;
  });

  test('Correct status code and return value', () => {
    newPosition = 1;
    const response = quizQuestionMoveV1(token, quizId, quesId1, newPosition);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Succesfully moves a question within the quiz', () => {
    test('Move the first question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV1(token, quizId, quesId1, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the first question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV1(token, quizId, quesId1, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId1);
    });

    test('Move the second question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV1(token, quizId, quesId2, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the second question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV1(token, quizId, quesId2, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV1(token, quizId, quesId3, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId3);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV1(token, quizId, quesId3, newPosition);
      const response = quizInfoV1(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionMoveV1(token, quizId, quesId1, 1);
    const response = quizInfoV1(token, quizId).jsonBody;
    const timeLastEdited = response.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      newPosition = 0;
      const randomQuestionId = 456;
      const response = quizQuestionMoveV1(token, quizId, randomQuestionId, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is less than 0', () => {
      newPosition = -1;
      const response = quizQuestionMoveV1(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      newPosition = 3;
      const response = quizQuestionMoveV1(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is the position of the current question', () => {
      newPosition = 1;
      const response = quizQuestionMoveV1(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      newPosition = 0;
      expect(quizQuestionMoveV1('', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      newPosition = 0;
      expect(quizQuestionMoveV1(token + 'random', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      newPosition = 0;
      authLogoutV1(token);
      expect(quizQuestionMoveV1(token, quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      newPosition = 0;
      const response = quizQuestionMoveV1(token, quizId + 1, quesId2, newPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionMoveV1(token2, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;
    const invalidNewPosition = -1;

    test('Unauthorised status code 401 first', () => {
      newPosition = 0;
      const response1 = quizQuestionMoveV1(invalidToken, invalidQuizId, invalidQuizId, invalidNewPosition);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      newPosition = 0;
      const response = quizQuestionMoveV1(token, invalidQuizId, invalidQuestionId, invalidNewPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionMoveV1(token, quizId, quesId1, invalidNewPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let token: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token as string;
    quizId = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV1(token, quizId, validQuestion1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV1(token, quizId, validQuestion2).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionDuplicateV1(token, quizId, questionId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ newQuestionId: expect.any(Number) });
  });

  test('Successfully duplicates the first question', () => {
    const newQuestionId = quizQuestionDuplicateV1(token, quizId, questionId1).jsonBody.newQuestionId as number;
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 3,
      questions: [
        {
          questionId: questionId1,
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        },
      ],
      duration: validQuestion1.duration * 2 + validQuestion2.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the middle question', () => {
    const questionId3 = quizQuestionCreateV1(token, quizId, validQuestion3).jsonBody.questionId as number;
    const newQuestionId = quizQuestionDuplicateV1(token, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 4,
      questions: [
        {
          questionId: questionId1,
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId3,
          question: validQuestion3.question,
          duration: validQuestion3.duration,
          points: validQuestion3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion3.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion3.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion3.answers[1].correct
            }
          ]
        }
      ],
      duration: validQuestion1.duration + validQuestion2.duration * 2 + validQuestion3.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the last question', () => {
    const newQuestionId = quizQuestionDuplicateV1(token, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 3,
      questions: [
        {
          questionId: questionId1,
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        }
      ],
      duration: validQuestion1.duration + validQuestion2.duration * 2
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionDuplicateV1(token, quizId, questionId1);
    const response2 = quizInfoV1(token, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    // Check if the timeLastEdited are within a 1 second range of the current time
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionDuplicateV1('', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionDuplicateV1(token + 'random', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizQuestionDuplicateV1(token, quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionDuplicateV1(token, -1, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionDuplicateV1(token2, quizId, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      const response = quizQuestionDuplicateV1(token, quizId, -1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionDuplicateV1(invalidToken, invalidQuizId, invalidQuestionId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionDuplicateV1(token, invalidQuizId, invalidQuestionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionDuplicateV1(token, quizId, invalidQuestionId);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
