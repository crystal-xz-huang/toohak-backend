import {
  clearV1,
  authRegisterV1,
  authLogoutV2,
  quizCreateV2,
  quizInfoV2,
  quizQuestionCreateV2,
  quizQuestionUpdateV2,
  quizQuestionRemoveV2,
  quizQuestionMoveV2,
  quizQuestionDuplicateV2,
} from '../testHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  USER1,
  USER2,
  QUIZ1,
  VALID_QUESTION1,
  VALID_QUESTION2,
  VALID_QUESTION3,
  VALID_QUESTION4,
  SHORT_QUESTION_STRING,
  LONG_QUESTION_STRING,
  MORE_QUESTION_ANSWERS,
  LESS_QUESTION_ANSWERS,
  NEGATIVE_QUESTION_DURATION,
  MORE_QUESTION_DURATION_SUM,
  LESS_QUESTION_POINTS,
  MORE_QUESTION_POINTS,
  SHORT_QUESTION_ANSWERS,
  LONG_QUESTION_ANSWERS,
  DUPLICATE_QUESTION_ANSWERS,
  FALSE_QUESTION_ANSWERS,
} from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
// Remove .skip from describe.skip to run the tests
// Use .only to run only that block of tests
//= =============================================================================

describe.skip('Testing PUT /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let token: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token, quizId, VALID_QUESTION1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV2(token, quizId, VALID_QUESTION2).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionUpdateV2(token, quizId, questionId1, VALID_QUESTION3);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successfully updates a question', () => {
    quizQuestionUpdateV2(token, quizId, questionId1, VALID_QUESTION2);
    const response = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 2,
      questions: [
        {
          questionId: questionId1,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        }
      ],
      duration: VALID_QUESTION2.duration * 2
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully updates 2 questions', () => {
    quizQuestionUpdateV2(token, quizId, questionId1, VALID_QUESTION3);
    quizQuestionUpdateV2(token, quizId, questionId2, VALID_QUESTION4);
    const response = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 2,
      questions: [
        {
          questionId: questionId1,
          question: VALID_QUESTION3.question,
          duration: VALID_QUESTION3.duration,
          points: VALID_QUESTION3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION3.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION3.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION3.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: VALID_QUESTION4.question,
          duration: VALID_QUESTION4.duration,
          points: VALID_QUESTION4.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION4.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION4.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION4.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION4.answers[1].correct
            }
          ]
        }
      ],
      duration: VALID_QUESTION3.duration + VALID_QUESTION4.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionUpdateV2(token, quizId, questionId1, VALID_QUESTION2);
    const response2 = quizInfoV2(token, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionUpdateV2('', quizId, questionId1, VALID_QUESTION2)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionUpdateV2(token + 'random', quizId, questionId1, VALID_QUESTION2)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(quizQuestionUpdateV2(token, quizId, questionId1, VALID_QUESTION2)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionUpdateV2(token, -1, questionId1, VALID_QUESTION2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionUpdateV2(token2, quizId, questionId1, VALID_QUESTION2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      const response = quizQuestionUpdateV2(token, quizId, -1, VALID_QUESTION2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(SHORT_QUESTION_STRING)('Question string is less than 5 characters', (question) => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question string is more than 100 characters', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, LONG_QUESTION_STRING);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question has more than 6 answers', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, MORE_QUESTION_ANSWERS);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(LESS_QUESTION_ANSWERS)('Question has less than 2 answers', (question) => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(NEGATIVE_QUESTION_DURATION)('Question duration is not a positive number', (question) => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Sum of the question durations in the quiz exceeds 3 minutes after update', () => {
      quizQuestionUpdateV2(token, quizId, questionId1, MORE_QUESTION_DURATION_SUM[0]);
      const response = quizQuestionUpdateV2(token, quizId, questionId2, MORE_QUESTION_DURATION_SUM[1]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are less than 1', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, LESS_QUESTION_POINTS);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are more than 10', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, MORE_QUESTION_POINTS);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(SHORT_QUESTION_ANSWERS)('Length of any answer is shorter than 1 character', (question) => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(LONG_QUESTION_ANSWERS)('Length of any answer is longer than 30 characters', (question) => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Any answer strings are duplicates of one another within the same question', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, DUPLICATE_QUESTION_ANSWERS);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('No correct answers', () => {
      const response = quizQuestionUpdateV2(token, quizId, questionId1, FALSE_QUESTION_ANSWERS);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionUpdateV2(invalidToken, invalidQuizId, invalidQuestionId, VALID_QUESTION2);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionUpdateV2(token, invalidQuizId, invalidQuestionId, VALID_QUESTION2);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionUpdateV2(token, quizId, invalidQuestionId, VALID_QUESTION2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing DELETE /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let token: string;
  let quizId: number;
  let questionId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId;
    const question = quizQuestionCreateV2(token, quizId, VALID_QUESTION1).jsonBody;
    questionId = question.questionId;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionRemoveV2(token, quizId, questionId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful removal of one question', () => {
    quizQuestionRemoveV2(token, quizId, questionId);
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(response.questions).toStrictEqual([]);
  });

  test('Successful removal of one question, and creation of a new question with the same body', () => {
    quizQuestionRemoveV2(token, quizId, questionId);
    const response1 = quizInfoV2(token, quizId).jsonBody;
    expect(response1.questions).toStrictEqual([]);
    quizQuestionCreateV2(token, quizId, VALID_QUESTION1);
    const response2 = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 1,
      questions: [
        {
          questionId: expect.any(Number),
          question: VALID_QUESTION1.question,
          duration: VALID_QUESTION1.duration,
          points: VALID_QUESTION1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[1].correct
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
    quizQuestionRemoveV2(token, quizId, questionId);
    const timeLastEdited = quizInfoV2(token, quizId).jsonBody.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Bad request errors', () => {
    test('Valid token but invalid questionId', () => {
      const response = quizQuestionRemoveV2(token, quizId, questionId + 1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    // test('Any session for this quiz is not in END state', () => {
    // });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionRemoveV2('', quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionRemoveV2(token + 'random', quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(quizQuestionRemoveV2(token, quizId, questionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionRemoveV2(token, quizId + 1, questionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionRemoveV2(token2, quizId, questionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionRemoveV2(invalidToken, quizId + 1, questionId + 1);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizQuestionRemoveV2(emptyToken, quizId + 1, questionId + 1);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response1 = quizQuestionRemoveV2(notOwnerToken, quizId, questionId + 1);
      expect(response1).toStrictEqual(FORBIDDEN_ERROR);
      const response2 = quizQuestionRemoveV2(token, quizId + 1, questionId + 1);
      expect(response2).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe.skip('Testing PUT /v2/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let token: string;
  let quizId: number;
  let quesId1: number;
  let quesId2: number;
  let quesId3: number;
  let newPosition: number;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;

    const q1 = quizQuestionCreateV2(token, quizId, VALID_QUESTION1).jsonBody;
    quesId1 = q1.questionId as number;

    const q2 = quizQuestionCreateV2(token, quizId, VALID_QUESTION2).jsonBody;
    quesId2 = q2.questionId as number;

    const q3 = quizQuestionCreateV2(token, quizId, VALID_QUESTION3).jsonBody;
    quesId3 = q3.questionId as number;
  });

  test('Correct status code and return value', () => {
    newPosition = 1;
    const response = quizQuestionMoveV2(token, quizId, quesId1, newPosition);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Succesfully moves a question within the quiz', () => {
    test('Move the first question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV2(token, quizId, quesId1, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the first question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV2(token, quizId, quesId1, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId1);
    });

    test('Move the second question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV2(token, quizId, quesId2, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the second question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV2(token, quizId, quesId2, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV2(token, quizId, quesId3, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId3);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV2(token, quizId, quesId3, newPosition);
      const response = quizInfoV2(token, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionMoveV2(token, quizId, quesId1, 1);
    const response = quizInfoV2(token, quizId).jsonBody;
    const timeLastEdited = response.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      newPosition = 0;
      const randomQuestionId = 456;
      const response = quizQuestionMoveV2(token, quizId, randomQuestionId, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is less than 0', () => {
      newPosition = -1;
      const response = quizQuestionMoveV2(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      newPosition = 3;
      const response = quizQuestionMoveV2(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is the position of the current question', () => {
      newPosition = 1;
      const response = quizQuestionMoveV2(token, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      newPosition = 0;
      expect(quizQuestionMoveV2('', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      newPosition = 0;
      expect(quizQuestionMoveV2(token + 'random', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      newPosition = 0;
      authLogoutV2(token);
      expect(quizQuestionMoveV2(token, quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      newPosition = 0;
      const response = quizQuestionMoveV2(token, quizId + 1, quesId2, newPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionMoveV2(token2, quizId, quesId2, newPosition);
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
      const response1 = quizQuestionMoveV2(invalidToken, invalidQuizId, invalidQuizId, invalidNewPosition);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      newPosition = 0;
      const response = quizQuestionMoveV2(token, invalidQuizId, invalidQuestionId, invalidNewPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionMoveV2(token, quizId, quesId1, invalidNewPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing POST /v2/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let token: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token, quizId, VALID_QUESTION1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV2(token, quizId, VALID_QUESTION2).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionDuplicateV2(token, quizId, questionId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ newQuestionId: expect.any(Number) });
  });

  test('Successfully duplicates the first question', () => {
    const newQuestionId = quizQuestionDuplicateV2(token, quizId, questionId1).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 3,
      questions: [
        {
          questionId: questionId1,
          question: VALID_QUESTION1.question,
          duration: VALID_QUESTION1.duration,
          points: VALID_QUESTION1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: VALID_QUESTION1.question,
          duration: VALID_QUESTION1.duration,
          points: VALID_QUESTION1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        },
      ],
      duration: VALID_QUESTION1.duration * 2 + VALID_QUESTION2.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the middle question', () => {
    const questionId3 = quizQuestionCreateV2(token, quizId, VALID_QUESTION3).jsonBody.questionId as number;
    const newQuestionId = quizQuestionDuplicateV2(token, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 4,
      questions: [
        {
          questionId: questionId1,
          question: VALID_QUESTION1.question,
          duration: VALID_QUESTION1.duration,
          points: VALID_QUESTION1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId3,
          question: VALID_QUESTION3.question,
          duration: VALID_QUESTION3.duration,
          points: VALID_QUESTION3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION3.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION3.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION3.answers[1].correct
            }
          ]
        }
      ],
      duration: VALID_QUESTION1.duration + VALID_QUESTION2.duration * 2 + VALID_QUESTION3.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the last question', () => {
    const newQuestionId = quizQuestionDuplicateV2(token, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 3,
      questions: [
        {
          questionId: questionId1,
          question: VALID_QUESTION1.question,
          duration: VALID_QUESTION1.duration,
          points: VALID_QUESTION1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION1.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: VALID_QUESTION2.question,
          duration: VALID_QUESTION2.duration,
          points: VALID_QUESTION2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[0].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: VALID_QUESTION2.answers[1].answer,
              colour: expect.any(String),
              correct: VALID_QUESTION2.answers[1].correct
            }
          ]
        }
      ],
      duration: VALID_QUESTION1.duration + VALID_QUESTION2.duration * 2
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionDuplicateV2(token, quizId, questionId1);
    const response2 = quizInfoV2(token, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    // Check if the timeLastEdited are within a 1 second range of the current time
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionDuplicateV2('', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionDuplicateV2(token + 'random', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV2(token);
      expect(quizQuestionDuplicateV2(token, quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionDuplicateV2(token, -1, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionDuplicateV2(token2, quizId, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      const response = quizQuestionDuplicateV2(token, quizId, -1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionDuplicateV2(invalidToken, invalidQuizId, invalidQuestionId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionDuplicateV2(token, invalidQuizId, invalidQuestionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionDuplicateV2(token, quizId, invalidQuestionId);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
