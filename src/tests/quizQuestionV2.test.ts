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
  quizSessionStartV1,
  quizSessionUpdateV1,
} from '../httpHelpers';

import {
  getTimeStamp,
  checkTimeStamp,
} from '../testHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  USER1,
  USER2,
  QUIZ1,
  QUESTION_BODY1,
  QUESTION_BODY2,
  QUESTION_BODY3,
  QUESTION_BODY4,
  // SHORT_QUESTION_STRING,
  // LONG_QUESTION_STRING,
  // MORE_QUESTION_ANSWERS,
  // LESS_QUESTION_ANSWERS,
  // LONG_QUESTION_DURATION,
  // NEGATIVE_QUESTION_DURATION,
  // MORE_QUESTION_DURATION_SUM,
  // LESS_QUESTION_POINTS,
  // MORE_QUESTION_POINTS,
  // SHORT_QUESTION_ANSWERS,
  // LONG_QUESTION_ANSWERS,
  // DUPLICATE_QUESTION_ANSWERS,
  // FALSE_QUESTION_ANSWERS,
  // INVALID_IMG_URLS,
} from '../testTypes';

import { Action } from '../dataTypes';
import sleep from 'atomic-sleep';

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
describe('Testing POST /v2/admin/quiz/{quizid}/question', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
  });

  test('Creates a new stub question for the quiz', () => {
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1);
    const response = quizInfoV2(token, quizId).jsonBody;
    const expectedQuestion = {
      questionId: expect.any(Number),
      question: QUESTION_BODY1.question,
      duration: QUESTION_BODY1.duration,
      points: QUESTION_BODY1.points,
      answers: [
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY1.answers[0].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY1.answers[0].correct
        },
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY1.answers[1].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY1.answers[1].correct
        }
      ],
      thumbnailUrl: QUESTION_BODY1.thumbnailUrl
    };

    expect(response.quizId).toStrictEqual(quizId);
    expect(response.questions).toStrictEqual([expectedQuestion]);
    expect(response.duration).toStrictEqual(QUESTION_BODY1.duration);
    expect(response.numQuestions).toStrictEqual(1);
  });

  test('Successfully creates 2 new stub questions for the quiz', () => {
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1);
    quizQuestionCreateV2(token, quizId, QUESTION_BODY2);
    const response = quizInfoV2(token, quizId).jsonBody;
    const expectedQuestion1 = {
      questionId: expect.any(Number),
      question: QUESTION_BODY1.question,
      duration: QUESTION_BODY1.duration,
      points: QUESTION_BODY1.points,
      answers: [
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY1.answers[0].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY1.answers[0].correct
        },
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY1.answers[1].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY1.answers[1].correct
        }
      ],
      thumbnailUrl: QUESTION_BODY1.thumbnailUrl,
    };
    const expectedQuestion2 = {
      questionId: expect.any(Number),
      question: QUESTION_BODY2.question,
      duration: QUESTION_BODY2.duration,
      points: QUESTION_BODY2.points,
      answers: [
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY2.answers[0].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY2.answers[0].correct
        },
        {
          answerId: expect.any(Number),
          answer: QUESTION_BODY2.answers[1].answer,
          colour: expect.any(String),
          correct: QUESTION_BODY2.answers[1].correct
        }
      ],
      thumbnailUrl: QUESTION_BODY2.thumbnailUrl,
    };
    expect(response.quizId).toStrictEqual(quizId);
    expect(response.questions).toStrictEqual([expectedQuestion1, expectedQuestion2]);
    expect(response.duration).toStrictEqual(QUESTION_BODY1.duration + QUESTION_BODY2.duration);
    expect(response.numQuestions).toStrictEqual(2);
  });
});

describe.skip('Testing PUT /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let token1: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY2).jsonBody.questionId as number;
  });

  test('Successfully updates a question with thumbnailUrls', () => {
    quizQuestionUpdateV2(token1, quizId, questionId1, QUESTION_BODY2);
    const response = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        }
      ],
      duration: QUESTION_BODY2.duration * 2,
      thumbnailUrl: QUESTION_BODY2.thumbnailUrl,
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully updates 2 questions with thumbnailUrls', () => {
    quizQuestionUpdateV2(token1, quizId, questionId1, QUESTION_BODY3);
    quizQuestionUpdateV2(token1, quizId, questionId2, QUESTION_BODY4);
    const response = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY3.question,
          duration: QUESTION_BODY3.duration,
          points: QUESTION_BODY3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY3.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY3.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY3.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: QUESTION_BODY4.question,
          duration: QUESTION_BODY4.duration,
          points: QUESTION_BODY4.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY4.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY4.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY4.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY4.answers[1].correct
            }
          ]
        }
      ],
      duration: QUESTION_BODY3.duration + QUESTION_BODY4.duration,
      thumbnailUrl: QUESTION_BODY4.thumbnailUrl,
    };
    expect(response).toStrictEqual(expected);
  });
});

describe.skip('Testing DELETE /v2/admin/quiz/{quizid}/question/{questionid}', () => {
  let token1: string;
  let token2: string;
  let quizId: number;
  let quizId2: number;
  let questionId: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token2, quizId2, QUESTION_BODY2);
    questionId = quizQuestionCreateV2(token1, quizId, QUESTION_BODY1).jsonBody.questionId as number;
  });

  test('Successful removal of one question, and creation of a new question with the same body', () => {
    quizQuestionRemoveV2(token1, quizId, questionId);
    const response1 = quizInfoV2(token1, quizId).jsonBody;
    expect(response1.questions).toStrictEqual([]);
    quizQuestionCreateV2(token1, quizId, QUESTION_BODY1);
    const response2 = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          points: QUESTION_BODY1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[1].correct
            }
          ]
        }
      ],
      duration: 4,
      thumbnailUrl: QUESTION_BODY1.thumbnailUrl,
    };
    expect(response2).toStrictEqual(expected);
  });

  describe('Bad request error if any session for this quiz is not in END state', () => {
    let sessionId1: number, sessionId2: number;
    beforeEach(() => {
      sessionId1 = quizSessionStartV1(token1, quizId, 0).jsonBody.sessionId as number;
      sessionId2 = quizSessionStartV1(token1, quizId, 0).jsonBody.sessionId as number;
      quizSessionUpdateV1(token1, quizId, sessionId1, Action.END);
    });
    test('One session is in LOBBY state`', () => {
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('All sessions are in END state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.END);
      expect(quizQuestionRemoveV2(token1, quizId, questionId).statusCode).toStrictEqual(200);
    });

    test('One session is in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.NEXT_QUESTION);
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in QUESTION_OPEN state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.SKIP_COUNTDOWN);
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in ANSWER_SHOW state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.GO_TO_ANSWER);
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in FINAL_RESULTS state', () => {
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId, sessionId2, Action.GO_TO_FINAL_RESULTS);
      expect(quizQuestionRemoveV2(token1, quizId, questionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing PUT /v2/admin/quiz/{quizid}/question/{questionid}/move', () => {
  let token1: string;
  let quizId: number;
  let quesId1: number;
  let quesId2: number;
  let quesId3: number;
  let newPosition: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;

    const q1 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY1).jsonBody;
    quesId1 = q1.questionId as number;

    const q2 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY2).jsonBody;
    quesId2 = q2.questionId as number;

    const q3 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY3).jsonBody;
    quesId3 = q3.questionId as number;
  });

  test('Correct status code and return value', () => {
    newPosition = 1;
    const response = quizQuestionMoveV2(token1, quizId, quesId1, newPosition);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Succesfully moves a question within the quiz', () => {
    test('Move the first question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV2(token1, quizId, quesId1, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the first question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV2(token1, quizId, quesId1, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId1);
    });

    test('Move the second question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV2(token1, quizId, quesId2, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId2);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId3);
    });

    test('Move the second question to the third position', () => {
      newPosition = 2;
      quizQuestionMoveV2(token1, quizId, quesId2, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the first position', () => {
      newPosition = 0;
      quizQuestionMoveV2(token1, quizId, quesId3, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId3);
      expect(response[1].questionId).toStrictEqual(quesId1);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });

    test('Move the third question to the second position', () => {
      newPosition = 1;
      quizQuestionMoveV2(token1, quizId, quesId3, newPosition);
      const response = quizInfoV2(token1, quizId).jsonBody.questions;
      expect(response[0].questionId).toStrictEqual(quesId1);
      expect(response[1].questionId).toStrictEqual(quesId3);
      expect(response[2].questionId).toStrictEqual(quesId2);
    });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = getTimeStamp();
    quizQuestionMoveV2(token1, quizId, quesId1, 1);
    const response = quizInfoV2(token1, quizId).jsonBody;
    const timeLastEdited = response.timeLastEdited as number;
    checkTimeStamp(timeLastEdited, expectedTime);
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      newPosition = 0;
      const randomQuestionId = 456;
      const response = quizQuestionMoveV2(token1, quizId, randomQuestionId, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is less than 0', () => {
      newPosition = -1;
      const response = quizQuestionMoveV2(token1, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is greater than n-1 where n is the number of questions', () => {
      newPosition = 3;
      const response = quizQuestionMoveV2(token1, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('NewPosition is the position of the current question', () => {
      newPosition = 1;
      const response = quizQuestionMoveV2(token1, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Unauthorised errors', () => {
    test('token1 is empty', () => {
      newPosition = 0;
      expect(quizQuestionMoveV2('', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('token1 does not refer to a valid user session', () => {
      newPosition = 0;
      expect(quizQuestionMoveV2(token1 + 'random', quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('token1 does not refer to a logged in user session', () => {
      newPosition = 0;
      authLogoutV2(token1);
      expect(quizQuestionMoveV2(token1, quizId, quesId2, newPosition)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token1 but invalid quizId', () => {
      newPosition = 0;
      const response = quizQuestionMoveV2(token1, quizId + 1, quesId2, newPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token1 but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token12 = invalidUser.token1 as string;
      const response = quizQuestionMoveV2(token12, quizId, quesId2, newPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidtoken1 = token1 + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;
    const invalidNewPosition = -1;

    test('Unauthorised status code 401 first', () => {
      newPosition = 0;
      const response1 = quizQuestionMoveV2(invalidtoken1, invalidQuizId, invalidQuizId, invalidNewPosition);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      newPosition = 0;
      const response = quizQuestionMoveV2(token1, invalidQuizId, invalidQuestionId, invalidNewPosition);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionMoveV2(token1, quizId, quesId1, invalidNewPosition);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing POST /v2/admin/quiz/{quizid}/question/{questionid}/duplicate', () => {
  let token1: string;
  let quizId: number;
  let questionId1: number;
  let questionId2: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    questionId2 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY2).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionDuplicateV2(token1, quizId, questionId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ newQuestionId: expect.any(Number) });
  });

  test('Successfully duplicates the first question', () => {
    const newQuestionId = quizQuestionDuplicateV2(token1, quizId, questionId1).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          points: QUESTION_BODY1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          points: QUESTION_BODY1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        },
      ],
      duration: QUESTION_BODY1.duration * 2 + QUESTION_BODY2.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the middle question', () => {
    const questionId3 = quizQuestionCreateV2(token1, quizId, QUESTION_BODY3).jsonBody.questionId as number;
    const newQuestionId = quizQuestionDuplicateV2(token1, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          points: QUESTION_BODY1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId3,
          question: QUESTION_BODY3.question,
          duration: QUESTION_BODY3.duration,
          points: QUESTION_BODY3.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY3.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY3.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY3.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY3.answers[1].correct
            }
          ]
        }
      ],
      duration: QUESTION_BODY1.duration + QUESTION_BODY2.duration * 2 + QUESTION_BODY3.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('Successfully duplicates the last question', () => {
    const newQuestionId = quizQuestionDuplicateV2(token1, quizId, questionId2).jsonBody.newQuestionId as number;
    const response = quizInfoV2(token1, quizId).jsonBody;
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
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          points: QUESTION_BODY1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY1.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY1.answers[1].correct
            }
          ]
        },
        {
          questionId: questionId2,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        },
        {
          questionId: newQuestionId,
          question: QUESTION_BODY2.question,
          duration: QUESTION_BODY2.duration,
          points: QUESTION_BODY2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[0].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: QUESTION_BODY2.answers[1].answer,
              colour: expect.any(String),
              correct: QUESTION_BODY2.answers[1].correct
            }
          ]
        }
      ],
      duration: QUESTION_BODY1.duration + QUESTION_BODY2.duration * 2
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionDuplicateV2(token1, quizId, questionId1);
    const response2 = quizInfoV2(token1, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    checkTimeStamp(timeLastEdited, expectedTime);
  });

  describe('Unauthorised errors', () => {
    test('token1 is empty', () => {
      expect(quizQuestionDuplicateV2('', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('token1 does not refer to a valid user session', () => {
      expect(quizQuestionDuplicateV2(token1 + 'random', quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('token1 does not refer to a logged in user session', () => {
      authLogoutV2(token1);
      expect(quizQuestionDuplicateV2(token1, quizId, questionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token1 but invalid quizId', () => {
      const response = quizQuestionDuplicateV2(token1, -1, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token1 but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token12 = invalidUser.token1 as string;
      const response = quizQuestionDuplicateV2(token12, quizId, questionId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Question Id does not refer to a valid question within this quiz', () => {
      const response = quizQuestionDuplicateV2(token1, quizId, -1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidtoken1 = token1 + 'random';
    const invalidQuizId = -1;
    const invalidQuestionId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionDuplicateV2(invalidtoken1, invalidQuizId, invalidQuestionId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionDuplicateV2(token1, invalidQuizId, invalidQuestionId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionDuplicateV2(token1, quizId, invalidQuestionId);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});