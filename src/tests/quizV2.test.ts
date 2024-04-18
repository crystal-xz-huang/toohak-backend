import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizListV2,
  quizCreateV2,
  quizInfoV2,
  quizNameUpdateV2,
  quizDescriptionUpdateV2,
  quizTransferV2,
  quizQuestionCreateV2,
  quizThumbnailUpdateV1,
  quizSessionStartV1,
  quizSessionUpdateV1,
} from '../httpHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  USER1,
  USER2,
  USER3,
  QUIZ1,
  QUIZ2,
  QUIZ3,
  SHORT_QUIZ_NAMES,
  INVALID_QUIZ_NAMES,
  INVALID_IMG_URLS,
  QUESTION_BODY1,
} from '../testTypes';

import {
  getTimeStamp,
  checkTimeStamp,
} from '../testHelpers';

import { Action } from '../dataTypes';
import sleep from 'atomic-sleep';
import { AdminQuizListReturn, AdminQuizInfoReturn } from '../functionTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing GET /v2/admin/quiz/list', () => {
  let token: string;
  beforeEach(() => {
    const ret = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = ret.token;
  });

  test('Correct status code and return value', () => {
    const response = quizListV2(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Successful retrieval when user has no quizzes', () => {
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has quizzes', () => {
    const response1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    const quizId1 = response1.quizId as number;
    const response2 = quizCreateV2(token, QUIZ2.name, QUIZ2.description).jsonBody;
    const quizId2 = response2.quizId as number;
    const response3 = quizCreateV2(token, QUIZ3.name, QUIZ3.description).jsonBody;
    const quizId3 = response3.quizId as number;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(quizListV2(token).jsonBody).toStrictEqual(expected);
    expect(quizListV2(token).statusCode).toStrictEqual(200);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizListV2('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizListV2(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizListV2(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });
});

describe('Testing POST /v2/admin/quiz', () => {
  let token: string;
  beforeEach(() => {
    const ret = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = ret.token;
  });

  test('Correct status code and return value', () => {
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('Successful creation of one quiz', () => {
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    const response2 = quizListV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: response.quizId as number, name: QUIZ1.name }] };
    expect(response2).toStrictEqual(expected);
  });

  test('QuizId is unique for two different quizzes', () => {
    const response1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    const quizId1 = response1.quizId as number;
    const response2 = quizCreateV2(token, QUIZ2.name, QUIZ2.description).jsonBody;
    const quizId2 = response2.quizId as number;
    expect(quizId1).not.toStrictEqual(quizId2);
  });

  test('timeCreated and timeLastEdited are within a 1 second range of the current time', () => {
    const expectedTime = getTimeStamp();
    const quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    const timeCreated = quizInfoV2(token, quizId).jsonBody.timeCreated as number;
    const timeLastEdited = quizInfoV2(token, quizId).jsonBody.timeLastEdited as number;
    checkTimeStamp(timeCreated, expectedTime);
    checkTimeStamp(timeLastEdited, expectedTime);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizCreateV2('', QUIZ1.name, QUIZ1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizCreateV2(token + 'random', QUIZ1.name, QUIZ1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizCreateV2(token, QUIZ1.name, QUIZ1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Empty name', () => {
      const response = quizCreateV2(token, '', QUIZ1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name less than 3 characters', () => {
      const response = quizCreateV2(token, 'Q', QUIZ1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name more than 30 characters', () => {
      const longName = 'Q'.repeat(31);
      const response = quizCreateV2(token, longName, QUIZ1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name already used for another quiz', () => {
      quizCreateV2(token, QUIZ1.name, QUIZ1.description);
      const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Description more than 100 characters', () => {
      const longDescription = 'Q'.repeat(101);
      const response = quizCreateV2(token, QUIZ1.name, longDescription);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    const alreadyUsedName = QUIZ1.name;
    const longName = 'Q'.repeat(31);
    const shortName = 'Q';
    const longDescription = 'Q'.repeat(101);

    test('Unauthorised status code 401 first', () => {
      const response1 = quizCreateV2(invalidToken, alreadyUsedName, longDescription);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizCreateV2(emptyToken, alreadyUsedName, longDescription);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 403 last', () => {
      const response1 = quizCreateV2(token, alreadyUsedName, longDescription);
      expect(response1).toStrictEqual(BAD_REQUEST_ERROR);
      const response2 = quizCreateV2(token, longName, QUIZ1.description);
      expect(response2).toStrictEqual(BAD_REQUEST_ERROR);
      const response3 = quizCreateV2(token, shortName, QUIZ1.description);
      expect(response3).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing GET /v2/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizInfoV2(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      quizId: quizId,
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: expect.any(Number),
      questions: expect.any(Array),
      duration: expect.any(Number),
      thumbnailUrl: expect.any(String),
    });
  });

  test('Successful retrieval of one quiz', () => {
    const expected: AdminQuizInfoReturn = {
      quizId: quizId,
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 0,
      questions: [],
      duration: 0,
      thumbnailUrl: expect.any(String),
    };
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(response).toStrictEqual(expected);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizInfoV2('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizInfoV2(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizInfoV2(token, quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizInfoV2(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizInfoV2(token2, quizId);
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
      const response1 = quizInfoV2(invalidToken, quizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizInfoV2(emptyToken, quizId);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizInfoV2(notOwnerToken, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe('Testing PUT /v2/admin/quiz/{quizid}/name', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value', () => {
    const update = quizNameUpdateV2(token, quizId, QUIZ2.name);
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.name).toStrictEqual(QUIZ2.name);
  });

  test('Successful update of one quiz name', () => {
    quizNameUpdateV2(token, quizId, QUIZ2.name);
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(response.name).toStrictEqual(QUIZ2.name);
  });

  test('Successful update of one quiz name, and creation of a new quiz with the old name', () => {
    quizNameUpdateV2(token, quizId, QUIZ2.name);
    quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV2(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [{ quizId: quizId, name: QUIZ2.name }, { quizId: expect.any(Number), name: QUIZ1.name }] });
  });

  test('timeLastEdited is set to the same value as timeCreated', () => {
    const timeCreated = quizInfoV2(token, quizId).jsonBody.timeCreated as number;
    const timeLastEdited = quizInfoV2(token, quizId).jsonBody.timeLastEdited as number;
    expect(timeCreated).toStrictEqual(timeLastEdited);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizNameUpdateV2('', quizId, QUIZ2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizNameUpdateV2(token + 'random', quizId, QUIZ2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizNameUpdateV2(token, quizId, QUIZ2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizNameUpdateV2(token, quizId + 1, QUIZ2.name);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizNameUpdateV2(token2, quizId, QUIZ2.name);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Name contains invalid characters', () => {
      const response = quizNameUpdateV2(token, quizId, 'Quiz 1&!');
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(SHORT_QUIZ_NAMES)('Name less than 3 characters="$name"', ({ name }) => {
      const response = quizNameUpdateV2(token, quizId, name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name more than 30 characters', () => {
      const longName = 'Q'.repeat(31);
      const response = quizNameUpdateV2(token, quizId, longName);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name already used for another quiz', () => {
      quizCreateV2(token, QUIZ2.name, QUIZ2.description);
      const response = quizNameUpdateV2(token, quizId, QUIZ2.name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    const invalidQuizId = quizId + 1;
    const invalidQuizName = 'Quiz 1&!';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizNameUpdateV2(invalidToken, invalidQuizId, invalidQuizName);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);

      const response2 = quizNameUpdateV2(emptyToken, invalidQuizId, invalidQuizName);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizNameUpdateV2(notOwnerToken, invalidQuizId, invalidQuizName);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test.each(INVALID_QUIZ_NAMES)('Bad request status code 400 last', ({ name }) => {
      const response = quizNameUpdateV2(token, quizId, name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing PUT /v2/admin/quiz/{quizid}/description', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value', () => {
    const update = quizDescriptionUpdateV2(token, quizId, QUIZ2.description);
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.description).toStrictEqual(QUIZ2.description);
  });

  test('Successful update of one quiz description', () => {
    quizDescriptionUpdateV2(token, quizId, QUIZ2.description);
    const response = quizInfoV2(token, quizId).jsonBody;
    expect(response.description).toStrictEqual(QUIZ2.description);
  });

  test('Successful update of one quiz description, and creation of a new quiz with the old description', () => {
    quizDescriptionUpdateV2(token, quizId, QUIZ2.description);
    const response1 = quizInfoV2(token, quizId).jsonBody;
    expect(response1.description).toStrictEqual(QUIZ2.description);

    const quizId2 = quizCreateV2(token, QUIZ2.name, QUIZ1.description).jsonBody.quizId as number;
    const response2 = quizInfoV2(token, quizId2).jsonBody.description as string;
    expect(response2).toStrictEqual(QUIZ1.description);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizDescriptionUpdateV2('', quizId, QUIZ2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizDescriptionUpdateV2(token + 'random', quizId, QUIZ2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizDescriptionUpdateV2(token, quizId, QUIZ2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizDescriptionUpdateV2(token, quizId + 1, QUIZ2.description);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizDescriptionUpdateV2(token2, quizId, QUIZ2.description);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  test('Bad request error with description more than 100 characters', () => {
    const longDescription = 'Q'.repeat(101);
    const response = quizDescriptionUpdateV2(token, quizId, longDescription);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = quizId + 1;
    const longDescription = 'Q'.repeat(101);
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizDescriptionUpdateV2(invalidToken, invalidQuizId, longDescription);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizDescriptionUpdateV2(notOwnerToken, invalidQuizId, longDescription);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizDescriptionUpdateV2(token, quizId, longDescription);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v2/admin/quiz/{quizid}/transfer', () => {
  let tokenUser1: string, tokenUser2: string;
  let quizId1: number;

  beforeEach(() => {
    tokenUser1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(tokenUser1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    tokenUser2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
  });

  test('Correct status code and return value', () => {
    const response = quizTransferV2(tokenUser1, quizId1, USER2.email);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful quiz transfer', () => {
    quizTransferV2(tokenUser1, quizId1, USER2.email);
    const response2 = quizListV2(tokenUser2).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response2).toStrictEqual(expected);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      const response = quizTransferV2('', quizId1, USER2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      const response = quizTransferV2(tokenUser1 + 'random', quizId1, USER2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      const response = quizTransferV2(tokenUser1, quizId1, USER2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTransferV2(tokenUser1, -1, USER2.email);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const response = quizTransferV2(tokenUser2, quizId1, USER2.email);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('userEmail is not a real User', () => {
      const response = quizTransferV2(tokenUser1, quizId1, USER3.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('userEmail is the current logged in user', () => {
      const response = quizTransferV2(tokenUser1, quizId1, USER1.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
      quizCreateV2(tokenUser2, QUIZ1.name, QUIZ2.description);
      const response = quizTransferV2(tokenUser1, quizId1, USER2.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error if any session for this quiz is not in END state', () => {
    let sessionId1: number, sessionId2: number;
    beforeEach(() => {
      quizQuestionCreateV2(tokenUser1, quizId1, QUESTION_BODY1);
      sessionId1 = quizSessionStartV1(tokenUser1, quizId1, 0).jsonBody.sessionId as number;
      sessionId2 = quizSessionStartV1(tokenUser1, quizId1, 0).jsonBody.sessionId as number;
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId1, Action.END);
    });
    test('One session is in LOBBY state`', () => {
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('All sessions are in END state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.END);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email).statusCode).toStrictEqual(200);
    });

    test('One session is in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.NEXT_QUESTION);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in QUESTION_OPEN state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.SKIP_COUNTDOWN);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in ANSWER_SHOW state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.GO_TO_ANSWER);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session is in FINAL_RESULTS state', () => {
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.NEXT_QUESTION);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(tokenUser1, quizId1, sessionId2, Action.GO_TO_FINAL_RESULTS);
      expect(quizTransferV2(tokenUser1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;
    const invalidUserEmail = 'invalid@gmail.com';
    test('Unauthorised status code 401 first', () => {
      const response = quizTransferV2(invalidToken, invalidQuizId, invalidUserEmail);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTransferV2(tokenUser1, invalidQuizId, invalidUserEmail);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizTransferV2(tokenUser1, quizId1, invalidUserEmail);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/thumbnail', () => {
  let token1: string;
  let token2: string;
  let quizId1: number;

  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
  });

  test('Successfully updates quiz thumbnail URL', () => {
    const newImgUrl = 'https://example.com/img.jpg';
    const response = quizThumbnailUpdateV1(token1, quizId1, newImgUrl);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Unauthorized errors', () => {
    test('Token is empty', () => {
      const imgUrl = 'https://example.com/img.jpg';
      expect(quizThumbnailUpdateV1('', quizId1, imgUrl)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      const imgUrl = 'https://example.com/img.jpg';
      expect(quizThumbnailUpdateV1(token1 + 'random', quizId1, imgUrl)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but user does not own the quiz', () => {
      const imgUrl = 'https://example.com/img.jpg';
      expect(quizThumbnailUpdateV1(token2, quizId1, imgUrl)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test.each(INVALID_IMG_URLS)('Invalid image URL format="%s"', (imgUrl) => {
      expect(quizThumbnailUpdateV1(token1, quizId1, imgUrl)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
